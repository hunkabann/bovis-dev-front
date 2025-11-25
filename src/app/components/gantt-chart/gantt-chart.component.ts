import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router'; // importar ActivatedRoute
import { ChartData, ChartOptions, ChartDataset } from 'chart.js';
import { GanttItem, ProjectService } from '../../services/project.service';
import type { TimeScaleOptions } from 'chart.js';

@Component({
  selector: 'app-gantt-chart',
  templateUrl: './gantt-chart.component.html',
  styleUrls: ['./gantt-chart.component.scss']
})
export class GanttChartComponent implements OnInit {
  public chartType: 'bar' = 'bar';

  // Declaramos chartData con el tipo correcto para objetos {x, y}
  public chartData: ChartData<'bar', { x: number | Date; y: string }[]> = {
    labels: [],
    datasets: []
  };

  public chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    indexAxis: 'y',
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      datalabels: {
        display: false,
        color: '#4ea7a7ff',
      },
      
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const index = ctx.dataIndex;
            const project = this.transformedProjects[index];
            const start = project.start;
            const end = new Date(start.getTime() + project.duration * 86400000);
            return `De: ${formatSimple(start)} a ${formatSimple(end)}`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        stacked: true,
        time: {
          unit: 'month',
          tooltipFormat: 'yyyy-MM-dd'
        },
        title: {
          display: true,
          text: 'Fechas'
        }
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: 'Etapas'
        }
      }
    }
  };

  min = new Date();
  max = new Date();
  transformedProjects: { y: string; start: Date; duration: number }[] = [];

  constructor(
    private projectService: ProjectService,
    private activatedRoute: ActivatedRoute // inyectar ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      const idProyecto = +params['proyecto']; // 👈 leer parámetro de URL

      if (!idProyecto) {
        console.error('No se proporcionó un id de proyecto');
        return;
      }

      this.projectService.getProjects(idProyecto).subscribe((data: GanttItem[]) => {
        this.transformedProjects = data.map(item => {
          const start = new Date(item.x[0]);
          const end = new Date(item.x[1]);
          const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24); // duración en días
          return {
            y: item.y,
            start,
            duration
          };
        });

        // Calcular fechas mínima y máxima
        const allDates: Date[] = this.transformedProjects.flatMap(t => [
          t.start,
          new Date(t.start.getTime() + t.duration * 86400000)
        ]);

        const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
        const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

        this.min = minDate;
        this.max = maxDate;

        // Ajustar el eje X con fechas
        const xScale = this.chartOptions.scales?.['x'] as TimeScaleOptions;
        xScale.min = minDate.toISOString();
        xScale.max = maxDate.toISOString();

        // Dataset invisible para el offset
        const offsetDataset: ChartDataset<'bar', { x: Date; y: string }[]> = {
          label: 'Offset',
          data: this.transformedProjects.map(p => ({
            x: p.start,
            y: p.y
          })),
          backgroundColor: 'rgba(0,0,0,0)',
          stack: 'stack1'
        };

        // Dataset visible para la duración
        const durationDataset: ChartDataset<'bar', { x: number; y: string }[]> = {
          label: 'Duración',
          data: this.transformedProjects.map(p => ({
            x: p.duration * 86400000, // duración en milisegundos
            y: p.y
          })),
          //backgroundColor: '#4ea7a7ff',
          //backgroundColor: this.transformedProjects.map((_, i) =>
          //  i === 0 ? '#000000b4' : '#4ea7a7ff' 
          //),
          backgroundColor: this.transformedProjects.map((_, i) => {
            if (i === 0) return '#000000b4'; // primera barra negra
            // alterna entre dos colores a partir de la segunda
            return i % 2 === 0 ? '#4ea7a7ff' : '#82ceceff';
          }),          
          borderRadius: 4,
          stack: 'stack1',
          barThickness: 20,
          maxBarThickness: 20,
          borderSkipped: false
        };

        //  Asignamos datasets con los tipos correctos
        this.chartData = {
          labels: [],
          datasets: [offsetDataset, durationDataset]
        };

        //  Establecer proyectos como categorías en el eje Y
        this.chartOptions.scales!['y'] = {
          type: 'category',
          labels: this.transformedProjects.map(p => p.y),
          stacked: true,
          title: {
            display: true,
            text: 'Etapas'
          }
        };
      });
    });
  }
}

// 🧹 Utilidad para formato simple de fecha
function formatSimple(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(d);
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// src/app/shared/shared-charts.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { GanttChartComponent } from '../components/gantt-chart/gantt-chart.component';

@NgModule({
  declarations: [GanttChartComponent],
  imports: [CommonModule, NgChartsModule],
  exports: [GanttChartComponent, NgChartsModule]
})
export class SharedChartsModule {}

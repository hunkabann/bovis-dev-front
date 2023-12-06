import { Component, OnInit } from '@angular/core';
import { Dor } from '../Models/dor';
import { ConfirmationService, MessageService, PrimeNGConfig, SortEvent } from 'primeng/api';

@Component({
  selector: 'app-dor',
  templateUrl: './dor.component.html',
  styleUrls: ['./dor.component.scss']
})
export class DorComponent implements OnInit {

  size = 10;
  page = 1;
  porcentaje = 35;
  header = [
    'Concepto',
    'Descripción',
    'Meta',
    'Ponderado',
    'Calificación',
    'Nivel 2',
    'Nivel 3',
    'Nivel 4',
    'Nivel 5'
  ];
  regDor: Dor = new Dor();
  ListDorModel: Dor[] = [];

  constructor(private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private primengConfig: PrimeNGConfig) { }

  ngOnInit(): void {

    if (localStorage.getItem("dor") != null) {
      this.ListDorModel = JSON.parse(localStorage.getItem("dor") || "[]");
      console.log(this.ListDorModel);
    }

  }

  customSort(event: SortEvent) {
    /* event.data.sort((data1, data2) => {
        let value1 = data1[event.field];
        let value2 = data2[event.field];
        let result = null;

        if (value1 == null && value2 != null)
            result = -1;
        else if (value1 != null && value2 == null)
            result = 1;
        else if (value1 == null && value2 == null)
            result = 0;
        else if (typeof value1 === 'string' && typeof value2 === 'string')
            result = value1.localeCompare(value2);
        else
            result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;

        return (event.order * result);
    }); */
}

confirm(event: Event, dor: Dor) {
  this.confirmationService.confirm({
    target: event.target as EventTarget,
    message: "¿Estás seguro de eliminar el registro?",
    icon: "pi  pi-trash c-del",
    accept: () => {
      setTimeout(() => {
        this.eliminarDor(dor);
        this.messageService.add({
          severity: "success",
          summary: "Dor",
          detail: "Registro eliminado correctamente"
        });
      }, 1000);
    },
    reject: () => {
      this.messageService.add({
        severity: "warn",
        summary: "Dor",
        detail: "Acción cancelada"
      });
    }
  });
}

eliminarDor(dor: Dor) {

  const index = this.ListDorModel.findIndex(obj => obj.id == dor.id)
  console.log(index);
  if (index > -1) {
    this.ListDorModel.splice(index, 1);
    localStorage.setItem("dor", JSON.stringify(this.ListDorModel))
  }
  console.log(this.ListDorModel);

}

}

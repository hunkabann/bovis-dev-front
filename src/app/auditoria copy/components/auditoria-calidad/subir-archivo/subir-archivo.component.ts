import { Component } from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-subir-archivo',
  templateUrl: './subir-archivo.component.html',
  styleUrls: ['./subir-archivo.component.css']
})
export class SubirArchivoComponent {

  motivo:         string = ''

  constructor(
    public ref: DynamicDialogRef
  ) { }

  subirArchivo() {
    this.ref.close({acepta: true, motivo: this.motivo})
  }

  closeDialog() {
    this.ref.close({acepta: false})
  }

}

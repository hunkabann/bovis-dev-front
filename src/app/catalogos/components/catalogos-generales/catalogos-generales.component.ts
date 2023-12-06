import { Component, OnInit } from '@angular/core';
import { CatalogosGenerales, Estatus } from '../../Models/catalogos';
import { CatalogosGeneralesService } from '../../services/catalogos-generales.service';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-catalogos-generales',
  templateUrl: './catalogos-generales.component.html',
  styleUrls: ['./catalogos-generales.component.scss'],
  styles: [`
    :host ::ng-deep .p-dialog .product-image {
        width: 150px;
        margin: 0 auto 2rem auto;
        display: block;
    }
  `],
})
export class CatalogosGeneralesComponent implements OnInit {
  isDialog: boolean = false;
  listCatalogo: CatalogosGenerales[];
  catElement: CatalogosGenerales = new CatalogosGenerales();
  selectedRegistros: CatalogosGenerales[];
  listEstatus: Estatus[];
  isNuevo: boolean = false;
  selectedEstatus: any;
  nombreServicio: string = '';
  loading: boolean = true;
  constructor(private catalogosService: CatalogosGeneralesService, private messageService: MessageService,
    private confirmationService: ConfirmationService) {
    this.nombreServicio = localStorage.getItem('nombreService') || '';
    //console.log(this.nombreServicio);
  }

  ngOnInit(): void {
    this.getDataCatalogo();
    this.listEstatus = [
      { value: true, label: 'Activo' },
      { value: false, label: 'Inactivo' }
    ];
  }

  getDataCatalogo() {
    this.catalogosService.getDataCatalogo(this.nombreServicio).subscribe(data => {
      this.listCatalogo = data.data;
    });
  }

  openDialog(registro: any) {
    registro != null ?
      (this.catElement = { ...registro }, this.isNuevo = true,
        this.selectedEstatus = this.listEstatus.find(xx => Boolean(xx.value) == Boolean(this.catElement.activo))
      ) :
      (this.catElement = new CatalogosGenerales(), this.isNuevo = false);

    this.isDialog = true;
  }

  save() {
  /*   console.log(this.catElement);
    console.log(this.selectedEstatus);
    console.log(this.isNuevo); */
    if (!this.isNuevo) {
      this.catalogosService.saveElement(this.catElement, this.nombreServicio).subscribe(data => {
        console.log(data);
        if (data) {

          this.messageService.add({
            severity: "success",
            summary: "Guardar",
            detail: "Registro guardado correctamente",
            life: 3000
          });
          this.getDataCatalogo();
        }
      });
    }else{
      //console.log(this.catElement);
      this.getPosicion();
      this.catalogosService.updateElement(this.catElement, this.nombreServicio).subscribe(data => {
       // console.log(data);
        if (data) {
          this.messageService.add({
            severity: "success",
            summary: "Editar",
            detail: "Registro editado correctamente",
            life: 2000
          });
          this.getDataCatalogo();
        }
      });
    }
    this.isDialog = false;
  }

  eliminarRegistro(registro: CatalogosGenerales) {
    this.confirmationService.confirm({
      message: 'Desea eliminar este registro?',
      header: 'Eliminar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Aceptar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.catalogosService.deleteElement(registro, this.nombreServicio).subscribe(data => {
          //console.log(data);
          if (data.success) {
            this.messageService.add({ severity: 'success', summary: 'Eliminación', detail: 'Registro eliminado correctamente.', life: 3000 });
            this.getDataCatalogo();
          }
        })
      },
      reject: () => {
        this.messageService.add({
          severity: "warn",
          summary: "",
          detail: "Acción cancelada"
        });
      }
    });

  }

  getPosicion(){
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }

}

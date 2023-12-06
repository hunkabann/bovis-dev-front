import { Component, OnInit } from '@angular/core';
import { Viaticos } from '../../Models/catalogos';
import { ViaticosService } from '../../services/viaticos.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PrimeIcons} from 'primeng/api';

@Component({
  selector: 'app-viaticos',
  templateUrl: './viaticos.component.html',
  styles: [`
  :host ::ng-deep .p-dialog .product-image {
      width: 150px;
      margin: 0 auto 2rem auto;
      display: block;
  }
`],
  styleUrls: ['./viaticos.component.scss']
})
export class ViaticosComponent implements OnInit {

  productDialog: boolean;
  products: Viaticos[];
  product: Viaticos = new Viaticos();
  listViaticosModel: Viaticos[] = [];
  selectedProducts: Viaticos[];
  submitted: boolean;

  constructor(private viaticosServ: ViaticosService, private messageService: MessageService, private confirmationService: ConfirmationService) {

    this.viaticosServ.getViaticos().subscribe(vi => {
      this.listViaticosModel = vi.data;
      //console.log(this.listViaticosModel);
    });
  }

  ngOnInit(): void {
  }

  openNew() {
    //this.product = {} | null;
    this.submitted = false;
    this.productDialog = true;
  }

  deleteSelectedProducts() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected products?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.products = this.products.filter(val => !this.selectedProducts.includes(val));
        this.selectedProducts = [];
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Products Deleted', life: 3000 });
      }
    });
  }

  editProduct(product: Viaticos) {
    this.product = { ...product };
    this.productDialog = true;
  }

  deleteProduct(product: Viaticos) {
    this.confirmationService.confirm({
      message: '¿Estás seguro de eliminar el registro?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.products = this.products.filter(val => val.id !== product.id);
        //this.product = {};
        this.messageService.add({ severity: 'success', summary: 'Viaticos', detail: 'Registro eliminado correctamente', life: 3000 });
      }
    });
  }

  hideDialog() {
    this.productDialog = false;
    this.submitted = false;
  }

  saveProduct() {
    this.submitted = true;

    /*  if (this.product.name.trim()) {
         if (this.product.id) {
             this.products[this.findIndexById(this.product.id)] = this.product;
             this.messageService.add({severity:'success', summary: 'Successful', detail: 'Product Updated', life: 3000});
         }
         else {
             this.product.id = this.createId();
             this.product.image = 'product-placeholder.svg';
             this.products.push(this.product);
             this.messageService.add({severity:'success', summary: 'Successful', detail: 'Product Created', life: 3000});
         }

         this.products = [...this.products];
         this.productDialog = false;
         this.product = {};
     } */
  }

  findIndexById(id: string): number {
    let index = -1;
    /* for (let i = 0; i < this.products.length; i++) {
      if (this.products[i].id === id) {
        index = i;
        break;
      }
    }
 */
    return index;
  }

  createId(): string {
    let id = '';
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < 5; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  }

}

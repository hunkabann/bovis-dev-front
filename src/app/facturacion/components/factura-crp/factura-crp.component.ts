import { Component, OnInit, ViewChild } from '@angular/core';
import { FacrurasNC, InfoProyecto, LstFacturas, ResponseXML } from '../../Models/FacturacionModels';
import { FacturacionService } from '../../services/facturacion.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-factura-crp',
  templateUrl: './factura-crp.component.html',
  styleUrls: ['./factura-crp.component.scss']
})
export class FacturaCrpComponent implements OnInit {

  isLoadingFacturas: boolean = false;
  fileSizeMax = 1000000;
  isClear: boolean = false;
  strFileBase64: string = '';
  listFacturasBase64: Array<LstFacturas> = new Array<LstFacturas>();
  infoProyecto: InfoProyecto = new InfoProyecto();
  @ViewChild('fileUpload') fileUpload: any;
  listResponse: Array<ResponseXML>;
  errorMEssageFile: string = '';

  constructor(private cargaFileServ: FacturacionService,
    private messageService: MessageService) { }

  ngOnInit(): void {
  }

  async onBasicUpload(event: any) {
    if (event && event.files) {
      //console.log('length: ' + event.files.length);
      this.isLoadingFacturas = true;
      await this.convertXML(event.files)
      //console.log(this.listFacturasBase64);

      setTimeout(
        ()=>{
        this.cargaFile()
      },3000);
    }
  }

  async convertXML(files: any) {
    return new Promise((resolve, reject) => {
      let listFacturasBase64Sub: Array<LstFacturas> = new Array<LstFacturas>();
      for (let file of files) {
        let reader = new FileReader();
        reader.onload = (evt) => {
          const xmlData: string = (evt as any).target.result;
          var parser = new DOMParser();
          var xmlz = parser.parseFromString(xmlData, "application/xml");
          this.strFileBase64 = window.btoa((new XMLSerializer()).serializeToString(xmlz));
          let stXML: LstFacturas = new LstFacturas();
          stXML.NombreFactura = file.name;
          stXML.FacturaB64 = this.strFileBase64
          //console.log(stXML);
          this.listFacturasBase64.push(stXML);
          //listFacturasBase64Sub.push(stXML);
          resolve(listFacturasBase64Sub);
        };
        reader.onerror = reject;
        reader.readAsText(file);
      }

    });
  }

  cargaFile() {

    let procesaFactura: FacrurasNC = new FacrurasNC();

    this.listFacturasBase64.forEach(element => {
      procesaFactura.LstFacturas.push(element);
    });

    this.listResponse = new Array<ResponseXML>();
    try {
      this.cargaFileServ.cargaXML_CRP(procesaFactura).subscribe({
        next: (data) => {
          //console.log(data);
          if (data.success) {
            this.listResponse = data.data;
            //console.log(this.listResponse);
            this.messageService.add({
              severity: "success",
              summary: "Validar",
              detail: "Facturas procesadas",
              life: 2000
            });
          }
        },
        error: (e) => {
          //console.log(e);
          let error = `${e.message} \n\n ${e.error}`
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: error,
            life: 2000
          });

          this.errorMEssageFile = error;
        }

      })
      this.isLoadingFacturas = false;
      this.isClear = true;
    } catch (err) {
      console.log(err);
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: String(err)
      });
    }

  }

  clearFile() {
    this.isClear = !this.isClear
    this.fileUpload.clear();
    this.listResponse = new Array<ResponseXML>();
    this.errorMEssageFile = '';
    this.listFacturasBase64 = new Array<LstFacturas>();
    this.listResponse = new Array<ResponseXML>();
  }

}

import { Component, OnInit, inject } from '@angular/core';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { ICatalogo, ICatalogoCliente, ICatalogoCombos, IEmpleado, IEmpleadoNew } from '../../models/ip';
import { CatalogosService } from '../../services/catalogos.service';
import { FormBuilder, Validators } from '@angular/forms';
import { PcsService } from '../../services/pcs.service';
import { TITLES, errorsArray } from 'src/utils/constants';
import { SharedService } from 'src/app/shared/services/shared.service';
import { finalize } from 'rxjs';
import { format } from 'date-fns';

@Component({
  selector: 'app-ip',
  templateUrl: './ip.component.html',
  styleUrls: ['./ip.component.css'],
  providers: [MessageService]
})
export class IpComponent implements OnInit {

  isConsulta: boolean = false;

  catSectores: ICatalogoCombos[] = [];
  catPaises: ICatalogoCombos[] = [];
  catClientes: ICatalogoCombos[] = [];
  catEstatusProyecto: ICatalogoCombos[] = [];
  catEmpleados: ICatalogoCombos[] = [];

  listCatSectores: Array<ICatalogo> = [];
  listCatPaises: Array<ICatalogo> = [];
  listCatClientes: Array<ICatalogoCliente> = [];
  listCatEstatusProyecto: Array<ICatalogo> = [];
  listEmpleados: Array<IEmpleadoNew> = [];

  form = this.fb.group({
      num_proyecto:                   [null, [Validators.required]],
      nombre_proyecto:                [null, [Validators.required]],
      alcance:                        [null, [Validators.required]],
      codigo_postal:                  [null, [Validators.required]],
      ciudad:                         [null, [Validators.required]],
      id_pais:                        [null, [Validators.required]],
      id_estatus:                     [null, [Validators.required]],
      id_sector:                      [null, [Validators.required]],
      id_tipo_proyecto:               [null],
      id_responsable_preconstruccion: [null],
      id_responsable_construccion:    [null],
      id_responsable_ehs:             [null],
      id_responsable_supervisor:      [null],
      id_cliente:                     [null],
      id_empresa:                     [null],
      id_director_ejecutivo:          [null, [Validators.required]],
      costo_promedio_m2:              [null],
      fecha_inicio:                   [null, [Validators.required]],
      fecha_fin:                      [null, [Validators.required]],
      // total_meses, Validators.required
      // contacto_nombre, Validators.required
      // contacto_posicion, Validators.required
      // contacto_telefono, Validators.required
      // contacto_correo, Validators.required
  })

  constructor(private config: PrimeNGConfig, private catServ: CatalogosService, private fb: FormBuilder, private pcsService: PcsService, private messageService: MessageService, private sharedService: SharedService) { }

  catalogosService = inject(CatalogosService)
  
  ngOnInit(): void {
    this.poblarCombos();
    this.getConfigCalendar();
    this.catalogosService.obtenerParametros()
      .subscribe(params => {
        console.log(params)
      })
  }

  getConfigCalendar() {
    this.config.setTranslation({
      firstDayOfWeek: 1,
      dayNames: [
        'domingo',
        'lunes',
        'martes',
        'miércoles',
        'jueves',
        'viernes',
        'sábado',
      ],
      dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
      dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
      monthNames: [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre',
      ],
      monthNamesShort: [
        'ene',
        'feb',
        'mar',
        'abr',
        'may',
        'jun',
        'jul',
        'ago',
        'sep',
        'oct',
        'nov',
        'dic',
      ],
      today: 'Hoy',
      clear: 'Limpiar',
    });
  }

  poblarCombos() {
    this.getCatCategorias();
    this.getPaises();
    this.getClientes();
    this.getEstatusProyecto();
    this.getEmpleados();
  }

  getCatCategorias() {
    this.listCatSectores = [];
    this.catServ.getSectores().subscribe((data) => {
      if (data.success) {
        this.listCatSectores = <ICatalogo[]>data['data'];
        this.listCatSectores.forEach((element) => {
          this.catSectores.push({
            name: String(element.descripcion),
            value: String(element.id),
          });
        });
      }
    });
  }

  getPaises() {
    this.listCatPaises = [];
    this.catServ.getPais().subscribe((data) => {
      if (data.success) {
        this.listCatPaises = <ICatalogo[]>data['data'];
        this.listCatPaises.forEach((element) => {
          this.catPaises.push({
            name: String(element.descripcion),
            value: String(element.id),
          });
        });
      }
    });
  }

  getClientes() {
    this.listCatClientes = [];
    this.catServ.getClientes().subscribe((data) => {
      if (data.success) {
        this.listCatClientes = <ICatalogoCliente[]>data['data'];
        this.listCatClientes.forEach((element) => {
          this.catClientes.push({
            name: String(element.cliente),
            value: String(element.idCliente),
          });
        });
      }
    });
  }

  getEstatusProyecto() {
    this.listCatEstatusProyecto = [];
    this.catServ.getEstatusProyecto().subscribe((data) => {
      if (data.success) {
        this.listCatEstatusProyecto = <ICatalogo[]>data['data'];
        this.listCatEstatusProyecto.forEach((element) => {
          this.catEstatusProyecto.push({
            name: String(element.descripcion),
            value: String(element.id),
          });
        });
      }
    });
  }

  getEmpleados() {
    this.listEmpleados = [];
    this.catServ.getEmpleados().subscribe((data) => {
      if (data.success) {
        this.listEmpleados = <IEmpleadoNew[]>data['data'];
        this.listEmpleados.forEach((element) => {
          this.catEmpleados.push({
            name: String(`${element.chnombre} ${element.chap_paterno} ${element.chap_materno} / ${element.chpuesto}`),
            value: String(element.nukid_empleado),
          });
        });
      }
    });
  }

  guardar() {
    
    console.log(this.form.value)

    if(!this.form.valid) {
      this.form.markAllAsTouched()
      return
    }

    this.sharedService.cambiarEstado(true)

    this.form.patchValue({
      fecha_inicio: this.form.value.fecha_inicio ? format(new Date(this.form.value.fecha_inicio), 'Y-MM-dd') as any : null,
      fecha_fin:    this.form.value.fecha_fin ? format(new Date(this.form.value.fecha_fin), 'Y-MM-dd') as any : null
    })

    this.pcsService.guardar(this.catalogosService.esEdicion, this.form.value)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {

        },
        error: (err) => {
          this.messageService.add({severity: 'error', summary: TITLES.error, detail: err.error})
        }
      })
  }

  esInvalido(campo: string): boolean {
    return this.form.get(campo).invalid && 
            (this.form.get(campo).dirty || this.form.get(campo).touched)
  }

  obtenerMensajeError(campo: string): string {
    let mensaje = ''

    errorsArray.forEach((error) => {
      if(this.form.get(campo).hasError(error.tipo))
        mensaje = error.mensaje.toString()
    })

    return mensaje
  }

}

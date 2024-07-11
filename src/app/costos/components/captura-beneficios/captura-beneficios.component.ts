import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { finalize, forkJoin } from 'rxjs';
import { EmpleadosService } from 'src/app/empleados/services/empleados.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { Opcion} from 'src/models/general.model';
import { CALENDAR, SUBJECTS,TITLES, errorsArray } from 'src/utils/constants';
import { ActivatedRoute, Router } from '@angular/router';
import { CostoEmpleado,Beneficio, BeneficiosProyectos } from '../../models/costos.model';
import { CostosService } from '../../services/costos.service';
import { differenceInCalendarYears, format } from 'date-fns';
import { GenericResponse, Proyectos } from 'src/app/empleados/Models/empleados';

@Component({
  selector: 'app-captura-beneficios',
  templateUrl: './captura-beneficios.component.html',
  styleUrls: ['./captura-beneficios.component.css'],
  providers: [MessageService]
})
export class CapturaBeneficiosComponent implements OnInit {

  empleadosService  = inject(EmpleadosService)
  fb                = inject(FormBuilder)
  messageService    = inject(MessageService)
  sharedService     = inject(SharedService)
  costosService   = inject(CostosService)
  esActualizacion = true
  costos: CostoEmpleado[] = []
  arraybeneficio: Beneficio[] = []
  data2: CostoEmpleado[] = []
  arraybeneficiosProyectos: BeneficiosProyectos[] = []

  costos2: GenericResponse

  disabledInput: boolean = false;
  cotizacion: string

  isvivienda: boolean = false;
  isAutomovil: boolean = false;
  isViaticosaComprobar: boolean = false;
  isBonoAdicionalReubicacion: boolean = false;
  isGasolina: boolean = false;
  isCasetas: boolean = false;
  isAyudaDeTransporte: boolean = false;
  isVuelosDeAvion: boolean = false;
  isProvisionImpuestosExpatsr: boolean = false;
  isFringeExpats: boolean = false;
  isProgramaDeEntretenimiento: boolean = false;
  isEventosEspeciales: boolean = false;
  isCostoIt: boolean = false;
  isCostoTelefonia: boolean = false;
  isSvDirectivos: boolean = false;
  isFacturacionBpm: boolean = false;

  isProy_vivienda: boolean = false;
  isProy_Automovil: boolean = false;
  isProy_ViaticosaComprobar: boolean = false;
  isProy_BonoAdicionalReubicacion: boolean = false;
  isProy_Gasolina: boolean = false;
  isProy_Casetas: boolean = false;
  isProy_AyudaDeTransporte: boolean = false;
  isProy_VuelosDeAvion: boolean = false;
  isProy_ProvisionImpuestosExpatsr: boolean = false;
  isProy_FringeExpats: boolean = false;
  isProy_ProgramaDeEntretenimiento: boolean = false;
  isProy_EventosEspeciales: boolean = false;
  isProy_CostoIt: boolean = false;
  isProy_CostoTelefonia: boolean = false;
  isProy_SvDirectivos: boolean = false;
  isProy_FacturacionBpm: boolean = false;

  idEmpleado: string;

  Costomenualproy = 0;
  bonoproyect_sueldobruto = 0;

  //calculo Impuesto Nomina
  bonoproyect_sueldobruto_ImpuestoNOM = 0;

  cargando:             boolean = false


  constructor( private router: Router,
    private activatedRoute: ActivatedRoute,
    private empleadosServ: EmpleadosService) { }

  form = this.fb.group({
    num_empleado:                 [null],
    vivienda:                     [0, Validators.required],
    automovil:                    [0, Validators.required],
    viaticos_a_comprobar:         [0, Validators.required],
    bono_adicional_reubicacion:   [0, Validators.required],
    gasolina:                     [0, Validators.required],
    casetas:                      [0, Validators.required],
    ayuda_de_transporte:          [0, Validators.required],
    vuelos_de_avion:              [0, Validators.required],
    provision_impuestos_expats:   [0, Validators.required],
    fringe_expats:                [0, Validators.required],
    programa_de_entretenimiento:  [0, Validators.required],
    eventos_especiales:           [0, Validators.required],
    otros:                        [0, Validators.required],
    costo_it:                     [0, Validators.required],
    costo_telefonia:              [0, Validators.required],
    sv_directivos:                [0, Validators.required],
    facturacion_bpm:              [0, Validators.required],
    id_persona:                   [null],
    persona_nombre:               [null],
    num_empleado_rr_hh:           [null],
    numEmpleadoNoi:               [null],
    ciudad:                       [null],
    reubicacion:                  [null],
    puesto:                       [null],
    pvDiasVacasAnuales:           [null],
    proyecto:                     [null],
    unidadNegocio:                [null],
    timesheet:                    [null],
    nombreJefe:                   [null],
    antiguedad:                   [null],
    sueldoBrutoInflacion:         [null],
    anual:                        [null],
    ptuProvision:                 [null],
    costoMensualEmpleado:         [null],
    costoMensualProyecto:         [null],
    costoAnualEmpleado:           [null],
    costoSalarioBruto:            [null],
    costoSalarioNeto:             [null],
    avgDescuentoEmpleado:         [null],
    montoDescuentoMensual:        [null],
    sueldoNetoPercibidoMensual:   [null],
    retencionImss:                [null],
    ispt:                         [null],
    empresa:                      [null],
    fechaIngreso:                 [null],
    aguinaldoCantidadMeses:       [null],
    aguinaldoMontoProvisionMensual: [null],
    vaidComisionCostoMensual:     [null],
    vaidCostoMensual:             null,
    svCostoMensual:               [null],
    svCostoTotalAnual:            null,
    sgmmCostoMensual:             [null],
    sgmmCostoTotalAnual:          [null],
    bonoAnualProvisionMensual:    [null],
    avgBonoAnualEstimado:         [null],
    indemProvisionMensual:        [null],
    pvProvisionMensual:           [null],
    impuesto3sNomina:             [null],
    imss:                         [null],
    retiro2:                      [null],
    cesantesVejez:                [null],
    infonavit:                    [null],
    cargasSociales:               [null],
    NumEmpleadoRrHh:              [null],
    beneficios:                   [null],
    costobeneficio:               [null],
    beneficio:                    [null],
    proy_vivienda:                     [0, Validators.required],
    proy_automovil:                    [0, Validators.required],
    proy_viaticos_a_comprobar:         [0, Validators.required],
    proy_bono_adicional_reubicacion:   [0, Validators.required],
    proy_gasolina:                     [0, Validators.required],
    proy_casetas:                      [0, Validators.required],
    proy_ayuda_de_transporte:          [0, Validators.required],
    proy_vuelos_de_avion:              [0, Validators.required],
    proy_provision_impuestos_expats:   [0, Validators.required],
    proy_fringe_expats:                [0, Validators.required],
    proy_programa_de_entretenimiento:  [0, Validators.required],
    proy_eventos_especiales:           [0, Validators.required],
    proy_otros:                        [0, Validators.required],
    proy_costo_it:                     [0, Validators.required],
    proy_costo_telefonia:              [0, Validators.required],
    proy_sv_directivos:                [0, Validators.required],
    proy_facturacion_bpm:              [0, Validators.required],
  })

  empleados: Opcion[] = []
  proyectos: Opcion[] = []

  NumEmpleado = null

  ngOnInit(): void {

    //Inicializa valiables beneficios en false

    this.isvivienda = false;
    this.isAutomovil = false;
    this.isViaticosaComprobar = false;
    this.isBonoAdicionalReubicacion = false;
    this.isGasolina = false;
    this.isCasetas = false;
    this.isAyudaDeTransporte = false;
    this.isVuelosDeAvion = false;
    this.isProvisionImpuestosExpatsr = false;
    this.isFringeExpats = false;
    this.isProgramaDeEntretenimiento = false;
    this.isEventosEspeciales = false;
    this.isCostoIt = false;
    this.isCostoTelefonia = false;
    this.isSvDirectivos = false;
    this.isFacturacionBpm = false;

    this.form.controls['num_empleado'].disable(); 
    this.form.controls['persona_nombre'].disable();               
    this.form.controls['num_empleado_rr_hh'].disable();           
    this.form.controls['numEmpleadoNoi'].disable();               
    this.form.controls['ciudad'].disable();                       
    this.form.controls['reubicacion'].disable();                 
    this.form.controls['puesto'].disable();                       
    this.form.controls['pvDiasVacasAnuales'].disable();           
    this.form.controls['proyecto'].disable();                     
    this.form.controls['unidadNegocio'].disable();                
    this.form.controls['timesheet'].disable();                    
    this.form.controls['nombreJefe'].disable();                   
    this.form.controls['antiguedad'].disable();                   
    this.form.controls['sueldoBrutoInflacion'].disable();         
    this.form.controls['anual'].disable();                        
    this.form.controls['ptuProvision'].disable();                 
    this.form.controls['costoMensualEmpleado'].disable();        
    this.form.controls['costoMensualProyecto'].disable();        
    this.form.controls['costoAnualEmpleado'].disable();           
    this.form.controls['costoSalarioBruto'].disable();            
    this.form.controls['costoSalarioNeto'].disable();             
    this.form.controls['avgDescuentoEmpleado'].disable();         
    this.form.controls['montoDescuentoMensual'].disable();        
    this.form.controls['sueldoNetoPercibidoMensual'].disable();   
    this.form.controls['retencionImss'].disable();                
    this.form.controls['ispt'].disable();                         
    this.form.controls['empresa'].disable();                      
    this.form.controls['fechaIngreso'].disable();                 
    this.form.controls['aguinaldoCantidadMeses'].disable();       
    this.form.controls['aguinaldoMontoProvisionMensual'].disable();
    this.form.controls['vaidComisionCostoMensual'].disable();     
    //this.form.controls['vaidCostoMensual'].disable();             
    this.form.controls['svCostoMensual'].disable();               
    //this.form.controls['svCostoTotalAnual'].disable();            
    this.form.controls['sgmmCostoMensual'].disable();             
    //this.form.controls['sgmmCostoTotalAnual'].disable();          
    this.form.controls['bonoAnualProvisionMensual'].disable();    
    //this.form.controls['avgBonoAnualEstimado'].disable();         
    this.form.controls['indemProvisionMensual'].disable();        
    this.form.controls['pvProvisionMensual'].disable();           
    this.form.controls['impuesto3sNomina'].disable();             
    this.form.controls['imss'].disable();                         
    this.form.controls['retiro2'].disable();                      
    this.form.controls['cesantesVejez'].disable();                
    this.form.controls['infonavit'].disable();                    
    this.form.controls['cargasSociales'].disable();
                  
   


    this.sharedService.cambiarEstado(true)

    this.activatedRoute.params
    .subscribe(({id}) => {
      forkJoin([
        id ? this.empleadosServ.getPersonas() : this.empleadosServ.getPersonasDisponibles(),
        this.empleadosServ.getCatEmpleados(),
        this.empleadosServ.getCatCategorias(),
        this.empleadosServ.getCatTiposContratos(),
        this.empleadosServ.getCatNivelEstudios(),
        this.empleadosServ.getCatFormasPago(),
        this.empleadosServ.getCatJornadas(),
        this.empleadosServ.getCatDepartamentos(),
        this.empleadosServ.getCatClasificacion(),
        this.empleadosServ.getCatUnidadNegocio(),
        this.empleadosServ.getCatTurno(),
        this.empleadosServ.getHabilidades(),
        this.empleadosServ.getExperiencias(),
        this.empleadosServ.getProfesiones(),
        this.empleadosServ.getPuestos(),
        this.empleadosServ.getEmpleados(),
        this.empleadosServ.getCatEstados(),
        this.empleadosServ.getCatPaises(),
        this.empleadosServ.getProyectos(),
      ])
      .pipe(finalize(() => this.verificarActualizacion()))
      .subscribe({
        next: ([
          empleadosR,proyectosR
        ]) => {
          this.empleados = empleadosR.data.map(empleado => ({name: empleado.chnombre, code: empleado.chap_materno}))
          this.proyectos = proyectosR.data.map(proyecto => ({name: proyecto.num_proyecto_principal, code: proyecto.chproyecto_principal}))
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
      })
    })

    

    

    this.empleadosService.getEmpleados()
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: ({data}) => {
          this.empleados = data.map(empleado => ({name: empleado.nombre_persona, code: empleado.nunum_empleado_rr_hh.toString()}))
          
          //NumEmpleado = this.empleados.num_empleado_rr_hh as any
        },
        error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: err.error})
      })
  }

  //getEmpleado

  verificarActualizacion() {

    this.activatedRoute.params
    .subscribe(({id}) => {
      if(id) {
        this.idEmpleado = id
        this.esActualizacion = true
        this.costosService.getCostoID(id)
          .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
          .subscribe({
            next: ({data}) => {

              this.arraybeneficio = data[0].beneficios
              this.arraybeneficiosProyectos = data[0].beneficiosproyecto
              const [costoR] = data
              this.costos = data

              this.Costomenualproy = 0

              const dato = this.arraybeneficio;
                 dato?.forEach(paso=>{
                     //console.log("paso.beneficio --------------> " +paso.beneficio);
                     //console.log("paso.cost-------------->> " +paso.costo);

                     this.Costomenualproy += +paso.costo

                     //console.log("suma paso.cost-------------->> " +this.Costomenualproy);
                     if(paso.beneficio === "Automóvil"){
                      this.isAutomovil = true;
                
                      this.form.patchValue({
                        automovil: paso.costo
                        
                      })
                    }
                    
                      if(paso.beneficio === "Vivienda"){

                        this.isvivienda = true;
                      
                        this.form.patchValue({
                          vivienda: paso.costo
                          
                        })
                      
                    }

                    if(paso.beneficio === "Viáticos a comprobar"){

                      this.isViaticosaComprobar = true;
                      
                      this.form.patchValue({
                        viaticos_a_comprobar: paso.costo
                        
                      })
                    
                    }

                    if(paso.beneficio === "Bono Adicional"){

                      this.isBonoAdicionalReubicacion = true;

                      //this.bonoproyect_sueldobruto += +paso.costo
                      //this.bonoproyect_sueldobruto_ImpuestoNOM += +paso.costo
                      
                      this.form.patchValue({
                        bono_adicional_reubicacion: paso.costo
                        
                      })
                    
                    }

                    if(paso.beneficio === "Gasolina"){

                      this.isGasolina = true;
                      
                      this.form.patchValue({
                        gasolina: paso.costo
                        
                      })
                    
                    }

                    if(paso.beneficio === "Casetas"){

                      this.isCasetas = true;
                      
                      this.form.patchValue({
                        casetas: paso.costo
                        
                      })
                    
                    }

                    if(paso.beneficio === "Ayuda de transporte"){

                      this.isAyudaDeTransporte = true;
                     // this.bonoproyect_sueldobruto_ImpuestoNOM += +paso.costo
                      
                      this.form.patchValue({
                        ayuda_de_transporte: paso.costo
                        
                      })
                    
                    }

                    if(paso.beneficio === "Vuelos de avión"){

                      this.isVuelosDeAvion = true;
                      
                      this.form.patchValue({
                        vuelos_de_avion: paso.costo
                        
                      })
                    
                    }

                    if(paso.beneficio === "Provisión Impuestos Expats"){

                      this.isProvisionImpuestosExpatsr = true;
                      
                      this.form.patchValue({
                        provision_impuestos_expats: paso.costo
                        
                      })
                    
                    }

                    if(paso.beneficio === "Programa de entrenamiento"){

                      this.isProgramaDeEntretenimiento = true;
                      
                      this.form.patchValue({
                        programa_de_entretenimiento: paso.costo
                        
                      })
                    
                    }

                    if(paso.beneficio === "Eventos especiales"){

                      this.isEventosEspeciales = true;
                      
                      this.form.patchValue({
                        eventos_especiales: paso.costo
                        
                      })
                    
                    }

                    if(paso.beneficio === "Costo IT"){

                      this.isCostoIt = true;
                      
                      this.form.patchValue({
                        costo_it: paso.costo
                        
                      })
                    
                    }

                    if(paso.beneficio === "Costo telefonia"){

                      this.isCostoTelefonia = true;
                      
                      this.form.patchValue({
                        costo_telefonia: paso.costo
                        
                      })
                    
                    }

                    if(paso.beneficio === "S.V. Directivos"){

                      this.isSvDirectivos = true;
                      
                      this.form.patchValue({
                        sv_directivos: paso.costo
                        
                      })
                    
                    }

                    if(paso.beneficio === "Facturación BPM"){

                      this.isFacturacionBpm = true;
                      
                      this.form.patchValue({
                        facturacion_bpm: paso.costo
                        
                      })
                    
                    }

                    if(paso.beneficio === "Fringe Expats"){

                      this.isFringeExpats = true;
                      
                      this.form.patchValue({
                        fringe_expats: paso.costo
                        
                      })
                    
                    }

                    

                    
                 
                     //paso.beneficio?.forEach(est =>{
                      //   console.log(est);
                        // est.Detalle.forEach(detalle => {
                         //    console.log(detalle);
                         //})
                    // })
                 })

                 //this.bonoproyect_sueldobruto = 0
                 const beneficiopryect = this.arraybeneficiosProyectos;
                 beneficiopryect?.forEach(paso=>{
                     
                   

                    if(paso.beneficio === "Automóvil"){
                      this.isProy_Automovil = true;
                
                      this.form.patchValue({
                        proy_automovil: paso.nucostobeneficio
                        
                      })
                    }
                    
                      if(paso.beneficio === "Vivienda"){

                        this.isProy_vivienda = true;
                      
                        this.form.patchValue({
                          proy_vivienda: paso.nucostobeneficio
                          
                        })
                      
                    }

                    if(paso.beneficio === "Viáticos a comprobar"){

                      this.isProy_ViaticosaComprobar = true;
                      
                      this.form.patchValue({
                        proy_viaticos_a_comprobar: paso.nucostobeneficio
                        
                      })
                    
                    }

                    if(paso.beneficio === "Bono Adicional"){

                      //console.log("Proyecto paso.beneficio --------------> " +paso.beneficio);
                      //console.log("Proyecto paso.cost-------------->> " +paso.nucostobeneficio);

                      this.isProy_BonoAdicionalReubicacion = true;
 
                     // this.bonoproyect_sueldobruto_ImpuestoNOM += +paso.nucostobeneficio

                      // this.bonoproyect_sueldobruto += +paso.nucostobeneficio
                       //console.log("Proyecto suma paso.cost-------------->> " +this.bonoproyect_sueldobruto);
                      
                      this.form.patchValue({
                        proy_bono_adicional_reubicacion: paso.nucostobeneficio
                        
                      })
                    
                    }

                    if(paso.beneficio === "Gasolina"){

                      this.isProy_Gasolina = true;
                      
                      this.form.patchValue({
                        proy_gasolina: paso.nucostobeneficio
                        
                      })
                    
                    }

                    if(paso.beneficio === "Casetas"){

                      this.isProy_Casetas = true;
                      
                      this.form.patchValue({
                        proy_casetas: paso.nucostobeneficio
                        
                      })
                    
                    }

                    if(paso.beneficio === "Ayuda de transporte"){

                      this.isProy_AyudaDeTransporte = true;
                      
                      this.form.patchValue({
                        proy_ayuda_de_transporte: paso.nucostobeneficio
                        
                      })
                    
                    }

                    if(paso.beneficio === "Vuelos de avión"){

                      this.isProy_VuelosDeAvion = true;
                      
                      this.form.patchValue({
                        proy_vuelos_de_avion: paso.nucostobeneficio
                        
                      })
                    
                    }

                    if(paso.beneficio === "Provisión Impuestos Expats"){

                      this.isProy_ProvisionImpuestosExpatsr = true;
                      
                      this.form.patchValue({
                        proy_provision_impuestos_expats: paso.nucostobeneficio
                        
                      })
                    
                    }

                    if(paso.beneficio === "Programa de entrenamiento"){

                      this.isProy_ProgramaDeEntretenimiento = true;
                      
                      this.form.patchValue({
                        proy_programa_de_entretenimiento: paso.nucostobeneficio
                        
                      })
                    
                    }

                    if(paso.beneficio === "Eventos especiales"){

                      this.isProy_EventosEspeciales = true;
                      
                      this.form.patchValue({
                        proy_eventos_especiales: paso.nucostobeneficio
                        
                      })
                    
                    }

                    if(paso.beneficio === "Costo IT"){

                      this.isProy_CostoIt = true;
                      
                      this.form.patchValue({
                        proy_costo_it: paso.nucostobeneficio
                        
                      })
                    
                    }

                    if(paso.beneficio === "Costo telefonia"){

                      this.isProy_CostoTelefonia = true;
                      
                      this.form.patchValue({
                        proy_costo_telefonia: paso.nucostobeneficio
                        
                      })
                    
                    }

                    if(paso.beneficio === "S.V. Directivos"){

                      this.isProy_SvDirectivos = true;
                      
                      this.form.patchValue({
                        proy_sv_directivos: paso.nucostobeneficio
                        
                      })
                    
                    }

                    if(paso.beneficio === "Facturación BPM"){

                      this.isProy_FacturacionBpm = true;
                      
                      this.form.patchValue({
                        proy_facturacion_bpm: paso.nucostobeneficio
                        
                      })
                    
                    }

                    if(paso.beneficio === "Fringe Expats"){

                      this.isProy_FringeExpats = true;
                      
                      this.form.patchValue({
                        proy_fringe_expats: paso.nucostobeneficio
                        
                      })
                    
                    }

                 })

                 //console.log("suma fuerapaso.cost-------------->> " +this.Costomenualproy);
        //this.puestos = puestosR.data.map(puesto => ({value: puesto.chpuesto, label: puesto.chpuesto}))

              //this.costos = data.map(empleado => (costoR.numEmpleadoRrHh))
              //this.costos.numEmpleadoRrHh
              let newDate = new Date(data.map(empleado => (costoR.fechaIngreso))+"");
              const date = new Date(data.map(empleado => (costoR.fechaIngreso))+"");

             // const beneficios = data.map(empleado => costoR.beneficios.toString())
              //const experiencias = data.beneficios.map(experiencia => experiencia.idExperiencia.toString())

             // console.log("suma aguinaldoMontoProvisionMensual-------------->> " +data.map(empleado => (costoR.aguinaldoMontoProvisionMensual)));
             // console.log("suma pvProvisionMensual-------------->> " +data.map(empleado => (costoR.pvProvisionMensual)));
             // console.log("suma avgBonoAnualEstimado-------------->> " +data.map(empleado => (costoR.avgBonoAnualEstimado)));
            //  console.log("suma avgBonoAnualEstimado-------------->> " +data.map(empleado => (costoR.avgBonoAnualEstimado)));
              

             // this.bonoproyect_sueldobruto_ImpuestoNOM += +data.map(empleado => (costoR.aguinaldoMontoProvisionMensual))
              //this.bonoproyect_sueldobruto_ImpuestoNOM += +data.map(empleado => (costoR.pvProvisionMensual))
              //this.bonoproyect_sueldobruto_ImpuestoNOM += +data.map(empleado => (costoR.avgBonoAnualEstimado))
             // this.bonoproyect_sueldobruto_ImpuestoNOM += +data.map(empleado => (costoR.avgBonoAnualEstimado))

              //console.log("this.bonoproyect_sueldobruto_ImpuestoNOM -------------->> " +this.bonoproyect_sueldobruto_ImpuestoNOM);

              this.form.patchValue({
                ciudad:                         data.map(empleado => (costoR.ciudad)),
                num_empleado_rr_hh:             data.map(empleado => (costoR.numEmpleadoRrHh)),
                numEmpleadoNoi:                 data.map(empleado => (costoR.numEmpleadoNoi)),
                reubicacion:                    data.map(empleado => (costoR.reubicacion)),
                puesto:                         data.map(empleado => (costoR.puesto)),
                pvDiasVacasAnuales:             data.map(empleado => (costoR.pvDiasVacasAnuales)),
                //proyecto:                       data.map(empleado => (costoR.proyecto)),
                unidadNegocio:                  data.map(empleado => (costoR.unidadNegocio)),
                empresa:                        data.map(empleado => (costoR.empresa)),
                timesheet:                      data.map(empleado => (costoR.timesheet)),
                fechaIngreso:                   format(new Date(newDate || null), 'dd/MM/y'),
                //nombreJefe:                     data.map(empleado => (costoR.nombreJefe)),
                antiguedad:                     this.formateaValor(data.map(empleado => (costoR.antiguedad))),
                sueldoBrutoInflacion:           this.formateaValor(data.map(empleado => (costoR.sueldoBrutoInflacion))),
                anual:                          this.formateaValor(data.map(empleado => (costoR.anual))),
                ptuProvision:                   this.formateaValor(data.map(empleado => (costoR.ptuProvision))),
                //costoMensualEmpleado:           this.formateaValor(data.map(empleado => (costoR.costoMensualEmpleado + this.Costomenualproy))),
                costoMensualEmpleado:           this.formateaValor(data.map(empleado => (costoR.costoMensualEmpleado ))),
                costoMensualProyecto:           this.formateaValor(data.map(empleado => (costoR.costoMensualProyecto))),
                costoAnualEmpleado:             this.formateaValor(data.map(empleado => (costoR.costoAnualEmpleado))),
                costoSalarioBruto:              this.formateaValor(data.map(empleado => (costoR.costoSalarioBruto))),
                costoSalarioNeto:               this.formateaValor(data.map(empleado => (costoR.costoSalarioNeto))),
                avgDescuentoEmpleado:           this.formateaValor(data.map(empleado => (costoR.avgDescuentoEmpleado*100))),
                montoDescuentoMensual:          this.formateaValor(data.map(empleado => (costoR.montoDescuentoMensual))),
                sueldoNetoPercibidoMensual:     this.formateaValor(data.map(empleado => (costoR.sueldoNetoPercibidoMensual))),
                retencionImss:                  this.formateaValor(data.map(empleado => (costoR.retencionImss))),
                ispt:                           this.formateaValor(data.map(empleado => (costoR.ispt))),
                aguinaldoCantidadMeses:         data.map(empleado => (costoR.aguinaldoCantidadMeses)),
                aguinaldoMontoProvisionMensual: this.formateaValor(data.map(empleado => (costoR.aguinaldoMontoProvisionMensual))),
                vaidComisionCostoMensual:       this.formateaValor(data.map(empleado => (costoR.vaidComisionCostoMensual))),
                vaidCostoMensual:               data.map(empleado => (costoR.vaidCostoMensual)),
                svCostoMensual:                 data.map(empleado => (costoR.svCostoMensual)),
                svCostoTotalAnual:              data.map(empleado => (costoR.svCostoTotalAnual)),
                sgmmCostoMensual:               this.formateaValor(data.map(empleado => (costoR.sgmmCostoMensual))),
                sgmmCostoTotalAnual:            this.formateaValor(data.map(empleado => (costoR.sgmmCostoTotalAnual))),
                bonoAnualProvisionMensual:      data.map(empleado => (costoR.bonoAnualProvisionMensual)),
                avgBonoAnualEstimado:           data.map(empleado => (costoR.avgBonoAnualEstimado)),
                indemProvisionMensual:          this.formateaValor(data.map(empleado => (costoR.indemProvisionMensual))),
                pvProvisionMensual:             this.formateaValor(data.map(empleado => (costoR.pvProvisionMensual))),
                impuesto3sNomina:               this.formateaValor(data.map(empleado => (costoR.impuesto3sNomina))),
                imss:                           this.formateaValor(data.map(empleado => (costoR.imss))),
                retiro2:                        this.formateaValor(data.map(empleado => (costoR.retiro2))),
                cesantesVejez:                  this.formateaValor(data.map(empleado => (costoR.cesantesVejez))),
                infonavit:                      this.formateaValor(data.map(empleado => (costoR.infonavit))),
                cargasSociales:                 this.formateaValor(data.map(empleado => (costoR.cargasSociales))),
                proyecto:                       data.map(empleado => (costoR.numProyecto)),
                //automovil: data[0].beneficios[0].costo,
                //beneficio:                      data.map(empleado => (costoR.beneficios).)o,
                
              })
              //this.form.controls['ciudad'].disable();
            
            },
            error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
          })
      } 
  })

    this.activatedRoute.params
      .subscribe(({id}) => {
        if(id) {

          this.esActualizacion = true
          this.empleadosServ.getEmpleado(id)
            .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
            .subscribe({
              next: ({data}) => {
                // console.log(data)
              const habilidades = data.habilidades.map(habilidad => habilidad.idHabilidad.toString())
              const experiencias = data.experiencias.map(experiencia => experiencia.idExperiencia.toString())
              this.cotizacion  = data.chcotizacion
                this.form.patchValue({
                  num_empleado:           data.nunum_empleado_rr_hh?.toString(),
                  id_persona:             data.nukidpersona?.toString(),
                  persona_nombre:         data.nombre_persona,
                  nombreJefe:             data.chjefe_directo
                  //proyecto:              data.nuproyecto_principal
                  
                })
              
              },
              error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
            })
        } 
    })

   
  }

  guardar() {
    //console.log(this.form.value);

    this.cargando = true

    const bodyVivienda = {
      //...this.form.value
      //fecha_ingreso:          format(new Date(this.form.value.fecha_ingreso || null), 'Y/MM/dd'),
      //fecha_salida:           this.form.value.fecha_salida ? format(new Date(this.form.value.fecha_salida), 'Y/MM/dd') : null,
      //fecha_ultimo_reingreso: this.form.value.fecha_ultimo_reingreso ? format(new Date(this.form.value.fecha_ultimo_reingreso), 'Y/MM/dd') : null

     //NumEmpleadoRrHh: this.form.value.num_empleado,
      NumEmpleadoRrHh: this.form.controls['num_empleado'].value,
      IdBeneficio: "1",
      Costo: this.form.value.vivienda
    }

    if(this.isvivienda){
      this.empleadosService.ActualizaBeneficioCosto(bodyVivienda,"/1/"+this.form.controls['num_empleado'].value)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          //this.form.reset()
          ////this.ngOnInit
          //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
        },
        error: (err) => {
          //console.log("error cuando es 0 beneficio VIVIENDA --------------> " +err.error.text);
          this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
  
          
        }
      })
    }else{

      if(this.form.value.vivienda != 0 || this.form.value.vivienda != 0.0 || this.form.value.vivienda != 0.00){
    
        this.empleadosService.guardarBeneficioCosto(bodyVivienda)
          .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
          .subscribe({
            next: (data) => {
              //this.form.reset()
              //this.ngOnInit
              //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
            },
            error: (err) => {
    
              //console.log("paso.beneficio VIVIENDA --------------> " +"/1/"+this.form.controls['num_empleado'].value);
    
              //console.log("error beneficio VIVIENDA --------------> " +err.error.text);
             
    
              this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
              this.empleadosService.ActualizaBeneficioCosto(bodyVivienda,"/1/"+this.form.controls['num_empleado'].value)
              .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
              .subscribe({
                next: (data) => {
                  //this.form.reset()
                  //this.ngOnInit
                  //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
                },
                error: (err) => {
                  this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
        
                  
                }
              })
            }
          })
    
      }

    }

  /*if(this.form.value.vivienda != 0 || this.form.value.vivienda != 0.0 || this.form.value.vivienda != 0.00){
    
    this.empleadosService.guardarBeneficioCosto(bodyVivienda)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          //this.form.reset()
          //this.ngOnInit
          //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
        },
        error: (err) => {

          console.log("paso.beneficio VIVIENDA --------------> " +"/1/"+this.form.controls['num_empleado'].value);

          console.log("error beneficio VIVIENDA --------------> " +err.error.text);
         

          this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
          this.empleadosService.ActualizaBeneficioCosto(bodyVivienda,"/1/"+this.form.controls['num_empleado'].value)
          .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
          .subscribe({
            next: (data) => {
              //this.form.reset()
              //this.ngOnInit
              //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
            },
            error: (err) => {
              this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
    
              
            }
          })
        }
      })

  }else{

    
    this.empleadosService.ActualizaBeneficioCosto(bodyVivienda,"/1/"+this.form.controls['num_empleado'].value)
    .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
    .subscribe({
      next: (data) => {
        //this.form.reset()
        //this.ngOnInit
        //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
      },
      error: (err) => {
        console.log("error cuando es 0 beneficio VIVIENDA --------------> " +err.error.text);
        this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

        
      }
    })
  }*/

  const bodyAutomovil = {
    //...this.form.value
    //fecha_ingreso:          format(new Date(this.form.value.fecha_ingreso || null), 'Y/MM/dd'),
    //fecha_salida:           this.form.value.fecha_salida ? format(new Date(this.form.value.fecha_salida), 'Y/MM/dd') : null,
    //fecha_ultimo_reingreso: this.form.value.fecha_ultimo_reingreso ? format(new Date(this.form.value.fecha_ultimo_reingreso), 'Y/MM/dd') : null
   
    //NumEmpleadoRrHh: this.form.value.num_empleado,
    NumEmpleadoRrHh: this.form.controls['num_empleado'].value,
    IdBeneficio: "2",
    Costo: this.form.value.automovil
  }

  if(this.isAutomovil){
    this.empleadosService.ActualizaBeneficioCosto(bodyAutomovil,"/2/"+this.form.controls['num_empleado'].value)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      //console.log("error cuando es 0 beneficio AUTOMOVIL --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
  }else{
  
      if(this.form.value.automovil != 0 || this.form.value.automovil != 0.0 || this.form.value.automovil != 0.00){
        //console.log("this.form.controls['num_empleado'] "+this.form.controls['num_empleado'].value + " this.form.controls['num_empleado_rr_hh'] "+ this.form.controls['num_empleado_rr_hh'].value)
        this.empleadosService.guardarBeneficioCosto(bodyAutomovil)
          .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
          .subscribe({
            next: (data) => {
              //this.form.reset()
              //this.ngOnInit
                //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
            },
            error: (err) => {
              this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
            }
          })
      
      }

  }

/*if(this.form.value.automovil != 0 || this.form.value.automovil != 0.0 || this.form.value.automovil != 0.00){
  //console.log("this.form.controls['num_empleado'] "+this.form.controls['num_empleado'].value + " this.form.controls['num_empleado_rr_hh'] "+ this.form.controls['num_empleado_rr_hh'].value)
  this.empleadosService.guardarBeneficioCosto(bodyAutomovil)
    .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
    .subscribe({
      next: (data) => {
        //this.form.reset()
        //this.ngOnInit
          //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
      }
    })

}else{

    
  this.empleadosService.ActualizaBeneficioCosto(bodyAutomovil,"/2/"+this.form.controls['num_empleado'].value)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      console.log("error cuando es 0 beneficio AUTOMOVIL --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
}*/

const bodyViaticosAComprobar = {
  //...this.form.value
  //fecha_ingreso:          format(new Date(this.form.value.fecha_ingreso || null), 'Y/MM/dd'),
  //fecha_salida:           this.form.value.fecha_salida ? format(new Date(this.form.value.fecha_salida), 'Y/MM/dd') : null,
  //fecha_ultimo_reingreso: this.form.value.fecha_ultimo_reingreso ? format(new Date(this.form.value.fecha_ultimo_reingreso), 'Y/MM/dd') : null

  //NumEmpleadoRrHh: this.form.value.num_empleado,
  NumEmpleadoRrHh: this.form.controls['num_empleado'].value,
  IdBeneficio: "3",
  Costo: this.form.value.viaticos_a_comprobar
}

if(this.isViaticosaComprobar){
  this.empleadosService.ActualizaBeneficioCosto(bodyViaticosAComprobar,"/3/"+this.form.controls['num_empleado'].value)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      //console.log("error cuando es 0 beneficio VIATIVCOSACOMPROBAR --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
}else{

  if(this.form.value.viaticos_a_comprobar != 0 || this.form.value.viaticos_a_comprobar != 0.0 || this.form.value.viaticos_a_comprobar != 0.00){

    this.empleadosService.guardarBeneficioCosto(bodyViaticosAComprobar)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          //this.form.reset()
          //this.ngOnInit
          //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
        }
      })
    
    }
}

/*if(this.form.value.viaticos_a_comprobar != 0 || this.form.value.viaticos_a_comprobar != 0.0 || this.form.value.viaticos_a_comprobar != 0.00){

this.empleadosService.guardarBeneficioCosto(bodyViaticosAComprobar)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
    }
  })

}else{

    
  this.empleadosService.ActualizaBeneficioCosto(bodyViaticosAComprobar,"/3/"+this.form.controls['num_empleado'].value)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      console.log("error cuando es 0 beneficio VIATIVCOSACOMPROBAR --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
}*/

const bodyBonoAdicional = {

  //NumEmpleadoRrHh: this.form.value.num_empleado,
  NumEmpleadoRrHh: this.form.controls['num_empleado'].value,
  IdBeneficio: "4",
  Costo: this.form.value.bono_adicional_reubicacion
}

if(this.isBonoAdicionalReubicacion){
  this.empleadosService.ActualizaBeneficioCosto(bodyBonoAdicional,"/4/"+this.form.controls['num_empleado'].value)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      console.log("error cuando es 0 beneficio BONOADICIONAL --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
}else{

  if(this.form.value.bono_adicional_reubicacion != 0 || this.form.value.bono_adicional_reubicacion != 0.0 || this.form.value.bono_adicional_reubicacion != 0.00){

    this.empleadosService.guardarBeneficioCosto(bodyBonoAdicional)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          //this.form.reset()
          //this.ngOnInit
          //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
        }
      })
    
    }
}

/*if(this.form.value.bono_adicional_reubicacion != 0 || this.form.value.bono_adicional_reubicacion != 0.0 || this.form.value.bono_adicional_reubicacion != 0.00){

this.empleadosService.guardarBeneficioCosto(bodyBonoAdicional)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
    }
  })

}else{

    
  this.empleadosService.ActualizaBeneficioCosto(bodyBonoAdicional,"/4/"+this.form.controls['num_empleado'].value)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      console.log("error cuando es 0 beneficio BONOADICIONAL --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
}*/

const bodyGasolina = {

  //NumEmpleadoRrHh: this.form.value.num_empleado,
  NumEmpleadoRrHh: this.form.controls['num_empleado'].value,
  IdBeneficio: "5",
  Costo: this.form.value.gasolina
}

if(this.isGasolina){
  this.empleadosService.ActualizaBeneficioCosto(bodyGasolina,"/5/"+this.form.controls['num_empleado'].value)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      console.log("error cuando es 0 beneficio GASOLINA --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
}else{

  if(this.form.value.gasolina != 0 || this.form.value.gasolina != 0.0 || this.form.value.gasolina != 0.00){

    this.empleadosService.guardarBeneficioCosto(bodyGasolina)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
         //this.form.reset()
          //this.ngOnInit
              //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
        }
      })
    
    }
}

/*if(this.form.value.gasolina != 0 || this.form.value.gasolina != 0.0 || this.form.value.gasolina != 0.00){

this.empleadosService.guardarBeneficioCosto(bodyGasolina)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
     //this.form.reset()
      //this.ngOnInit
          //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
    }
  })

}else{

    
  this.empleadosService.ActualizaBeneficioCosto(bodyGasolina,"/5/"+this.form.controls['num_empleado'].value)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      console.log("error cuando es 0 beneficio GASOLINA --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
}*/

const bodyCasetas = {

  //NumEmpleadoRrHh: this.form.value.num_empleado,
  NumEmpleadoRrHh: this.form.controls['num_empleado'].value,
  IdBeneficio: "6",
  Costo: this.form.value.casetas
}

if(this.isCasetas){
  this.empleadosService.ActualizaBeneficioCosto(bodyCasetas,"/6/"+this.form.controls['num_empleado'].value)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      console.log("error cuando es 0 beneficio CASETAS --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
}else{

  if(this.form.value.casetas != 0 || this.form.value.casetas != 0.0 || this.form.value.casetas != 0.00){

    this.empleadosService.guardarBeneficioCosto(bodyCasetas)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          //this.form.reset()
          //this.ngOnInit
              //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
        }
      })
    
    }
}

/*if(this.form.value.casetas != 0 || this.form.value.casetas != 0.0 || this.form.value.casetas != 0.00){

this.empleadosService.guardarBeneficioCosto(bodyCasetas)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
          //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
    }
  })

}else{

    
  this.empleadosService.ActualizaBeneficioCosto(bodyCasetas,"/6/"+this.form.controls['num_empleado'].value)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      console.log("error cuando es 0 beneficio CASETAS --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
}*/

const bodyAyudaTransporte = {

  //NumEmpleadoRrHh: this.form.value.num_empleado,
  NumEmpleadoRrHh: this.form.controls['num_empleado'].value,
  IdBeneficio: "7",
  Costo: this.form.value.ayuda_de_transporte
}

if(this.isAyudaDeTransporte){
  this.empleadosService.ActualizaBeneficioCosto(bodyAyudaTransporte,"/7/"+this.form.controls['num_empleado'].value)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      console.log("error cuando es 0 beneficio AYUDADETRANSPORTE --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
}else{

  if(this.form.value.ayuda_de_transporte != 0 || this.form.value.ayuda_de_transporte != 0.0 || this.form.value.ayuda_de_transporte != 0.00){

    this.empleadosService.guardarBeneficioCosto(bodyAyudaTransporte)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
         //this.form.reset()
          //this.ngOnInit
              //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
        }
      })
    
    }
}

/*if(this.form.value.ayuda_de_transporte != 0 || this.form.value.ayuda_de_transporte != 0.0 || this.form.value.ayuda_de_transporte != 0.00){

this.empleadosService.guardarBeneficioCosto(bodyAyudaTransporte)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
     //this.form.reset()
      //this.ngOnInit
          //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
    }
  })

}else{

    
  this.empleadosService.ActualizaBeneficioCosto(bodyAyudaTransporte,"/7/"+this.form.controls['num_empleado'].value)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      console.log("error cuando es 0 beneficio AYUDADETRANSPORTE --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
}*/

const bodyVuelosAvion = {

  //NumEmpleadoRrHh: this.form.value.num_empleado,
  NumEmpleadoRrHh: this.form.controls['num_empleado'].value,
  IdBeneficio: "8",
  Costo: this.form.value.vuelos_de_avion
}

if(this.isVuelosDeAvion){
  this.empleadosService.ActualizaBeneficioCosto(bodyVuelosAvion,"/8/"+this.form.controls['num_empleado'].value)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      console.log("error cuando es 0 beneficio VUELOSAVION --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
}else{

  if(this.form.value.vuelos_de_avion != 0 || this.form.value.vuelos_de_avion != 0.0 || this.form.value.vuelos_de_avion != 0.00){

    this.empleadosService.guardarBeneficioCosto(bodyVuelosAvion)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          //this.form.reset()
          //this.ngOnInit
              //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
        }
      })
    
    }
}

/*if(this.form.value.vuelos_de_avion != 0 || this.form.value.vuelos_de_avion != 0.0 || this.form.value.vuelos_de_avion != 0.00){

this.empleadosService.guardarBeneficioCosto(bodyVuelosAvion)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
          //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
    }
  })

}else{

    
  this.empleadosService.ActualizaBeneficioCosto(bodyVuelosAvion,"/8/"+this.form.controls['num_empleado'].value)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      console.log("error cuando es 0 beneficio VUELOSAVION --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
}*/

const bodyprovisionImpues = {

  //NumEmpleadoRrHh: this.form.value.num_empleado,
  NumEmpleadoRrHh: this.form.controls['num_empleado'].value,
  IdBeneficio: "9",
  Costo: this.form.value.provision_impuestos_expats
}

if(this.isProvisionImpuestosExpatsr){
  this.empleadosService.ActualizaBeneficioCosto(bodyprovisionImpues,"/9/"+this.form.controls['num_empleado'].value)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      console.log("error cuando es 0 beneficio PROVISIONDESCUENTO --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
}else{

  if(this.form.value.provision_impuestos_expats != 0 || this.form.value.provision_impuestos_expats != 0.0 || this.form.value.provision_impuestos_expats != 0.00){

    this.empleadosService.guardarBeneficioCosto(bodyprovisionImpues)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          //this.form.reset()
          //this.ngOnInit
              //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
        }
      })
    
    }
}

/*if(this.form.value.provision_impuestos_expats != 0 || this.form.value.provision_impuestos_expats != 0.0 || this.form.value.provision_impuestos_expats != 0.00){

this.empleadosService.guardarBeneficioCosto(bodyprovisionImpues)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
          //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
    }
  })

}else{

    
  this.empleadosService.ActualizaBeneficioCosto(bodyprovisionImpues,"/9/"+this.form.controls['num_empleado'].value)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      console.log("error cuando es 0 beneficio PROVISIONDESCUENTO --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
}*/

const bodyFringeExpats = {

  //NumEmpleadoRrHh: this.form.value.num_empleado,
  NumEmpleadoRrHh: this.form.controls['num_empleado'].value,
  IdBeneficio: "3007",
  Costo: this.form.value.fringe_expats
}

if(this.isFringeExpats){
  this.empleadosService.ActualizaBeneficioCosto(bodyFringeExpats,"/3007/"+this.form.controls['num_empleado'].value)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      console.log("error cuando es 0 beneficio FRINGEEXPANTS --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
}else{

  if(this.form.value.fringe_expats != 0 || this.form.value.fringe_expats != 0.0 || this.form.value.fringe_expats != 0.00){

    this.empleadosService.guardarBeneficioCosto(bodyFringeExpats)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          //this.form.reset()
          //this.ngOnInit
          //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
        }
      })
    
    }
}

/*if(this.form.value.fringe_expats != 0 || this.form.value.fringe_expats != 0.0 || this.form.value.fringe_expats != 0.00){

this.empleadosService.guardarBeneficioCosto(bodyFringeExpats)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
    }
  })

}else{

    
  this.empleadosService.ActualizaBeneficioCosto(bodyFringeExpats,"/3007/"+this.form.controls['num_empleado'].value)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      console.log("error cuando es 0 beneficio FRINGEEXPANTS --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
}*/

const bodyProgramadeEntrenamiento = {

  //NumEmpleadoRrHh: this.form.value.num_empleado,
  NumEmpleadoRrHh: this.form.controls['num_empleado'].value,
  IdBeneficio: "10",
  Costo: this.form.value.programa_de_entretenimiento
}

if(this.isProgramaDeEntretenimiento){
  this.empleadosService.ActualizaBeneficioCosto(bodyProgramadeEntrenamiento,"/10/"+this.form.controls['num_empleado'].value)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      console.log("error cuando es 0 beneficio PROGRAMADEENTRETENIMIENTO --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
}else{

  if(this.form.value.programa_de_entretenimiento != 0 || this.form.value.programa_de_entretenimiento != 0.0 || this.form.value.programa_de_entretenimiento != 0.00){

    this.empleadosService.guardarBeneficioCosto(bodyProgramadeEntrenamiento)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          //this.form.reset()
          //this.ngOnInit
          //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
        }
      })
    
    }
}

/*if(this.form.value.programa_de_entretenimiento != 0 || this.form.value.programa_de_entretenimiento != 0.0 || this.form.value.programa_de_entretenimiento != 0.00){

this.empleadosService.guardarBeneficioCosto(bodyProgramadeEntrenamiento)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
    }
  })

}else{

    
  this.empleadosService.ActualizaBeneficioCosto(bodyProgramadeEntrenamiento,"/10/"+this.form.controls['num_empleado'].value)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      console.log("error cuando es 0 beneficio PROGRAMADEENTRETENIMIENTO --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
}*/

const bodyEventosEspeciales = {

  //NumEmpleadoRrHh: this.form.value.num_empleado,
  NumEmpleadoRrHh: this.form.controls['num_empleado'].value,
  IdBeneficio: "11",
  Costo: this.form.value.eventos_especiales
}

if(this.isEventosEspeciales){
  this.empleadosService.ActualizaBeneficioCosto(bodyEventosEspeciales,"/11/"+this.form.controls['num_empleado'].value)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      console.log("error cuando es 0 beneficio EVENTOSESPECIALES --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
}else{

  if(this.form.value.eventos_especiales != 0 || this.form.value.eventos_especiales != 0.0 || this.form.value.eventos_especiales != 0.00){

    this.empleadosService.guardarBeneficioCosto(bodyEventosEspeciales)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
         //this.form.reset()
          //this.ngOnInit
              //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
        }
      })
    
    }
}

/*if(this.form.value.eventos_especiales != 0 || this.form.value.eventos_especiales != 0.0 || this.form.value.eventos_especiales != 0.00){

this.empleadosService.guardarBeneficioCosto(bodyEventosEspeciales)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
     //this.form.reset()
      //this.ngOnInit
          //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
    }
  })

}else{

    
  this.empleadosService.ActualizaBeneficioCosto(bodyEventosEspeciales,"/11/"+this.form.controls['num_empleado'].value)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      console.log("error cuando es 0 beneficio EVENTOSESPECIALES --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
}*/

/**const bodyOtros = {

  NumEmpleadoRrHh: this.form.value.num_empleado,
  IdBeneficio: "3",
  Costo: this.form.value.otros
}

if(this.form.value.otros != 0 || this.form.value.otros != 0.0 || this.form.value.otros != 0.00){

this.empleadosService.guardarBeneficioCosto(bodyOtros)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      this.form.reset()
      this.router.navigate(['/costos/captura-beneficios'], {queryParams: {success: true}});
    },
    error: (err) => {
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
    }
  })

}*/

const bodyCostoIT = {

  //NumEmpleadoRrHh: this.form.value.num_empleado,
  NumEmpleadoRrHh: this.form.controls['num_empleado'].value,
  IdBeneficio: "1005",
  Costo: this.form.value.costo_it
}

if(this.isCostoIt){
  this.empleadosService.ActualizaBeneficioCosto(bodyCostoIT,"/1005/"+this.form.controls['num_empleado'].value)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      console.log("error cuando es 0 beneficio COSTOIT --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
}else{

  if(this.form.value.costo_it != 0 || this.form.value.costo_it != 0.0 || this.form.value.costo_it != 0.00){

    this.empleadosService.guardarBeneficioCosto(bodyCostoIT)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
         //this.form.reset()
          //this.ngOnInit
              //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
        }
      })
    
    }
}
/*if(this.form.value.costo_it != 0 || this.form.value.costo_it != 0.0 || this.form.value.costo_it != 0.00){

this.empleadosService.guardarBeneficioCosto(bodyCostoIT)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
     //this.form.reset()
      //this.ngOnInit
          //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
    }
  })

}else{

    
  this.empleadosService.ActualizaBeneficioCosto(bodyCostoIT,"/1005/"+this.form.controls['num_empleado'].value)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      console.log("error cuando es 0 beneficio COSTOIT --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
}*/

const bodyCosto_telefonia = {

  //NumEmpleadoRrHh: this.form.value.num_empleado,
  NumEmpleadoRrHh: this.form.controls['num_empleado'].value,
  IdBeneficio: "2005",
  Costo: this.form.value.costo_telefonia
}

if(this.isCostoTelefonia){
  this.empleadosService.ActualizaBeneficioCosto(bodyCosto_telefonia,"/2005/"+this.form.controls['num_empleado'].value)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      console.log("error cuando es 0 beneficio TELEFONIA --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
}else{

  if(this.form.value.costo_telefonia != 0 || this.form.value.costo_telefonia != 0.0 || this.form.value.costo_telefonia != 0.00){

    this.empleadosService.guardarBeneficioCosto(bodyCosto_telefonia)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          //this.form.reset()
          //this.ngOnInit
              //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
        }
      })
    
    }
}

/*if(this.form.value.costo_telefonia != 0 || this.form.value.costo_telefonia != 0.0 || this.form.value.costo_telefonia != 0.00){

this.empleadosService.guardarBeneficioCosto(bodyCosto_telefonia)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
          //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
    }
  })

}else{

    
  this.empleadosService.ActualizaBeneficioCosto(bodyCosto_telefonia,"/2005/"+this.form.controls['num_empleado'].value)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      console.log("error cuando es 0 beneficio TELEFONIA --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
}*/

const bodySV_Directivos = {

  //NumEmpleadoRrHh: this.form.value.num_empleado,
  NumEmpleadoRrHh: this.form.controls['num_empleado'].value,
  IdBeneficio: "3005",
  Costo: this.form.value.sv_directivos
}

if(this.isSvDirectivos){
  this.empleadosService.ActualizaBeneficioCosto(bodySV_Directivos,"/3005/"+this.form.controls['num_empleado'].value)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      console.log("error cuando es 0 beneficio SVDIRECTOS --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
}else{

  if(this.form.value.sv_directivos != 0 || this.form.value.sv_directivos != 0.0 || this.form.value.sv_directivos != 0.00){

    this.empleadosService.guardarBeneficioCosto(bodySV_Directivos)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          //this.form.reset()
          //this.ngOnInit
              //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
        }
      })
    
    }
}
/*if(this.form.value.sv_directivos != 0 || this.form.value.sv_directivos != 0.0 || this.form.value.sv_directivos != 0.00){

this.empleadosService.guardarBeneficioCosto(bodySV_Directivos)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
          //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
    }
  })

}else{

    
  this.empleadosService.ActualizaBeneficioCosto(bodySV_Directivos,"/3005/"+this.form.controls['num_empleado'].value)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      console.log("error cuando es 0 beneficio SVDIRECTOS --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
}*/

const bodyFacturacion_BPM = {

  //NumEmpleadoRrHh: this.form.value.num_empleado,
  NumEmpleadoRrHh: this.form.controls['num_empleado'].value,
  IdBeneficio: "3006",
  Costo: this.form.value.facturacion_bpm
}

if(this.isFacturacionBpm){
  this.empleadosService.ActualizaBeneficioCosto(bodyFacturacion_BPM,"/3006/"+this.form.controls['num_empleado'].value)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      console.log("error cuando es 0 beneficio FACTURABPM --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
}else{

  if(this.form.value.facturacion_bpm != 0 || this.form.value.facturacion_bpm != 0.0 || this.form.value.facturacion_bpm != 0.00){

    this.empleadosService.guardarBeneficioCosto(bodyFacturacion_BPM)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          //this.form.reset()
          //this.ngOnInit
              //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
        }
      })
    
    }
}




/** BENEFICIOS DEL PROYECTO */


const bodyProyectoVivienda = {
  //...this.form.value
  //fecha_ingreso:          format(new Date(this.form.value.fecha_ingreso || null), 'Y/MM/dd'),
  //fecha_salida:           this.form.value.fecha_salida ? format(new Date(this.form.value.fecha_salida), 'Y/MM/dd') : null,
  //fecha_ultimo_reingreso: this.form.value.fecha_ultimo_reingreso ? format(new Date(this.form.value.fecha_ultimo_reingreso), 'Y/MM/dd') : null

 //NumEmpleadoRrHh: this.form.value.num_empleado,
   NumProyecto: this.form.controls['proyecto'].value?.toString(),
   //NumProyecto: this.form.value.proyecto?.toString(),
   NumEmpleadoRrHh: this.form.controls['num_empleado'].value,
   IdBeneficio: "1",
   nucostobeneficio: this.form.value.proy_vivienda
}

if(this.isProy_vivienda){
  this.empleadosService.ActualizaProyectoBeneficioCosto(bodyProyectoVivienda,"/1/"+this.form.controls['num_empleado'].value )
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      console.log("error cuando es 0 beneficio PROYECTO VIVIENDA --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
}else{

  if(this.form.value.proy_vivienda != 0 || this.form.value.proy_vivienda != 0.0 || this.form.value.proy_vivienda != 0.00){

    this.empleadosService.guardarProyectoBeneficioCosto(bodyProyectoVivienda)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          //this.form.reset()
          //this.ngOnInit
          //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
        },
        error: (err) => {

          console.log("paso.beneficio VIVIENDA --------------> " +"/1/"+this.form.controls['num_empleado'].value);

          console.log("error beneficio VIVIENDA --------------> " +err.error.text);
         

          this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
          this.empleadosService.ActualizaProyectoBeneficioCosto(bodyProyectoVivienda,"/1/"+this.form.controls['num_empleado'].value)
          .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
          .subscribe({
            next: (data) => {
              //this.form.reset()
              //this.ngOnInit
              //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
            },
            error: (err) => {
              this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
    
              
            }
          })
        }
      })

  }

}

const bodyProyectoAutomovil = {
  //...this.form.value
  //fecha_ingreso:          format(new Date(this.form.value.fecha_ingreso || null), 'Y/MM/dd'),
  //fecha_salida:           this.form.value.fecha_salida ? format(new Date(this.form.value.fecha_salida), 'Y/MM/dd') : null,
  //fecha_ultimo_reingreso: this.form.value.fecha_ultimo_reingreso ? format(new Date(this.form.value.fecha_ultimo_reingreso), 'Y/MM/dd') : null
 
  //NumEmpleadoRrHh: this.form.value.num_empleado,
  NumProyecto: this.form.controls['proyecto'].value?.toString(),
  NumEmpleadoRrHh: this.form.controls['num_empleado'].value,
  IdBeneficio: "2",
  nucostobeneficio: this.form.value.proy_automovil
}

if(this.isProy_Automovil){
  this.empleadosService.ActualizaProyectoBeneficioCosto(bodyProyectoAutomovil,"/2/"+this.form.controls['num_empleado'].value)
.pipe(finalize(() => this.sharedService.cambiarEstado(false)))
.subscribe({
  next: (data) => {
    //this.form.reset()
    //this.ngOnInit
    //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
  },
  error: (err) => {
    console.log("error cuando es 0 beneficio AUTOMOVIL --------------> " +err.error.text);
    this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

    
  }
})
}else{

    if(this.form.value.proy_automovil != 0 || this.form.value.proy_automovil != 0.0 || this.form.value.proy_automovil != 0.00){
      //console.log("this.form.controls['num_empleado'] "+this.form.controls['num_empleado'].value + " this.form.controls['num_empleado_rr_hh'] "+ this.form.controls['num_empleado_rr_hh'].value)
      this.empleadosService.guardarProyectoBeneficioCosto(bodyProyectoAutomovil)
        .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
        .subscribe({
          next: (data) => {
            //this.form.reset()
            //this.ngOnInit
              //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
          }
        })
    
    }

}



const bodyProyectoViaticosAComprobar = {
//...this.form.value
//fecha_ingreso:          format(new Date(this.form.value.fecha_ingreso || null), 'Y/MM/dd'),
//fecha_salida:           this.form.value.fecha_salida ? format(new Date(this.form.value.fecha_salida), 'Y/MM/dd') : null,
//fecha_ultimo_reingreso: this.form.value.fecha_ultimo_reingreso ? format(new Date(this.form.value.fecha_ultimo_reingreso), 'Y/MM/dd') : null

//NumEmpleadoRrHh: this.form.value.num_empleado,
NumProyecto: this.form.controls['proyecto'].value?.toString(),
NumEmpleadoRrHh: this.form.controls['num_empleado'].value,
IdBeneficio: "3",
nucostobeneficio: this.form.value.proy_viaticos_a_comprobar
}

if(this.isProy_ViaticosaComprobar){
this.empleadosService.ActualizaProyectoBeneficioCosto(bodyProyectoViaticosAComprobar,"/3/"+this.form.controls['num_empleado'].value)
.pipe(finalize(() => this.sharedService.cambiarEstado(false)))
.subscribe({
  next: (data) => {
    //this.form.reset()
    //this.ngOnInit
    //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
  },
  error: (err) => {
    console.log("error cuando es 0 beneficio VIATIVCOSACOMPROBAR --------------> " +err.error.text);
    this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

    
  }
})
}else{

if(this.form.value.proy_viaticos_a_comprobar != 0 || this.form.value.proy_viaticos_a_comprobar != 0.0 || this.form.value.proy_viaticos_a_comprobar != 0.00){

  this.empleadosService.guardarProyectoBeneficioCosto(bodyProyectoViaticosAComprobar)
    .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
    .subscribe({
      next: (data) => {
        //this.form.reset()
        //this.ngOnInit
        //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
      }
    })
  
  }
}




const bodyProyectoBonoAdicional = {

  //NumEmpleadoRrHh: this.form.value.num_empleado,
  NumProyecto: this.form.controls['proyecto'].value?.toString(),
  NumEmpleadoRrHh: this.form.controls['num_empleado'].value,
  IdBeneficio: "4",
  nucostobeneficio: this.form.value.proy_bono_adicional_reubicacion
}

if(this.isProy_BonoAdicionalReubicacion){
  this.empleadosService.ActualizaProyectoBeneficioCosto(bodyProyectoBonoAdicional,"/4/"+this.form.controls['num_empleado'].value)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      console.log("error cuando es 0 beneficio BONOADICIONAL --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
}else{

  if(this.form.value.proy_bono_adicional_reubicacion != 0 || this.form.value.proy_bono_adicional_reubicacion != 0.0 || this.form.value.proy_bono_adicional_reubicacion != 0.00){

    this.empleadosService.guardarProyectoBeneficioCosto(bodyProyectoBonoAdicional)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          //this.form.reset()
          //this.ngOnInit
          //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
        }
      })
    
    }
}


const bodyProyectoGasolina = {

  //NumEmpleadoRrHh: this.form.value.num_empleado,
  NumProyecto: this.form.controls['proyecto'].value?.toString(),
  NumEmpleadoRrHh: this.form.controls['num_empleado'].value,
  IdBeneficio: "5",
  nucostobeneficio: this.form.value.proy_gasolina
}

if(this.isProy_Gasolina){
  this.empleadosService.ActualizaProyectoBeneficioCosto(bodyProyectoGasolina,"/5/"+this.form.controls['num_empleado'].value)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      console.log("error cuando es 0 beneficio GASOLINA --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
}else{

  if(this.form.value.proy_gasolina != 0 || this.form.value.proy_gasolina != 0.0 || this.form.value.proy_gasolina != 0.00){

    this.empleadosService.guardarProyectoBeneficioCosto(bodyProyectoGasolina)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
         //this.form.reset()
          //this.ngOnInit
              //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
        }
      })
    
    }
}


const bodyProyectoCasetas = {

  //NumEmpleadoRrHh: this.form.value.num_empleado,
  NumProyecto: this.form.controls['proyecto'].value?.toString(),
  NumEmpleadoRrHh: this.form.controls['num_empleado'].value,
  IdBeneficio: "6",
  nucostobeneficio: this.form.value.proy_casetas
}

if(this.isProy_Casetas){
  this.empleadosService.ActualizaProyectoBeneficioCosto(bodyProyectoCasetas,"/6/"+this.form.controls['num_empleado'].value)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      console.log("error cuando es 0 beneficio CASETAS --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
}else{

  if(this.form.value.proy_casetas != 0 || this.form.value.proy_casetas != 0.0 || this.form.value.proy_casetas != 0.00){

    this.empleadosService.guardarProyectoBeneficioCosto(bodyProyectoCasetas)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          //this.form.reset()
          //this.ngOnInit
              //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
        }
      })
    
    }
}



const bodyProyectoAyudaTransporte = {

  //NumEmpleadoRrHh: this.form.value.num_empleado,
  NumProyecto: this.form.controls['proyecto'].value?.toString(),
  NumEmpleadoRrHh: this.form.controls['num_empleado'].value,
  IdBeneficio: "7",
  nucostobeneficio: this.form.value.proy_ayuda_de_transporte
}

if(this.isProy_AyudaDeTransporte){
  this.empleadosService.ActualizaProyectoBeneficioCosto(bodyProyectoAyudaTransporte,"/7/"+this.form.controls['num_empleado'].value)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      console.log("error cuando es 0 beneficio AYUDADETRANSPORTE --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
}else{

  if(this.form.value.proy_ayuda_de_transporte != 0 || this.form.value.proy_ayuda_de_transporte != 0.0 || this.form.value.proy_ayuda_de_transporte != 0.00){

    this.empleadosService.guardarProyectoBeneficioCosto(bodyProyectoAyudaTransporte)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
         //this.form.reset()
          //this.ngOnInit
              //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
        }
      })
    
    }
}



const bodyProyectoVuelosAvion = {

  //NumEmpleadoRrHh: this.form.value.num_empleado,
  NumProyecto: this.form.controls['proyecto'].value?.toString(),
  NumEmpleadoRrHh: this.form.controls['num_empleado'].value,
  IdBeneficio: "8",
  nucostobeneficio: this.form.value.proy_vuelos_de_avion
}

if(this.isProy_VuelosDeAvion){
  this.empleadosService.ActualizaProyectoBeneficioCosto(bodyProyectoVuelosAvion,"/8/"+this.form.controls['num_empleado'].value)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      console.log("error cuando es 0 beneficio VUELOSAVION --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
}else{

  if(this.form.value.proy_vuelos_de_avion != 0 || this.form.value.proy_vuelos_de_avion != 0.0 || this.form.value.proy_vuelos_de_avion != 0.00){

    this.empleadosService.guardarProyectoBeneficioCosto(bodyProyectoVuelosAvion)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          //this.form.reset()
          //this.ngOnInit
              //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
        }
      })
    
    }
}



const bodyProyectoprovisionImpues = {

  //NumEmpleadoRrHh: this.form.value.num_empleado,
  NumProyecto: this.form.controls['proyecto'].value?.toString(),
  NumEmpleadoRrHh: this.form.controls['num_empleado'].value,
  IdBeneficio: "9",
  nucostobeneficio: this.form.value.proy_provision_impuestos_expats
}

if(this.isProy_ProvisionImpuestosExpatsr){
  this.empleadosService.ActualizaProyectoBeneficioCosto(bodyProyectoprovisionImpues,"/9/"+this.form.controls['num_empleado'].value)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      console.log("error cuando es 0 beneficio PROVISIONDESCUENTO --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
}else{

  if(this.form.value.proy_provision_impuestos_expats != 0 || this.form.value.proy_provision_impuestos_expats != 0.0 || this.form.value.proy_provision_impuestos_expats != 0.00){

    this.empleadosService.guardarProyectoBeneficioCosto(bodyProyectoprovisionImpues)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          //this.form.reset()
          //this.ngOnInit
              //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
        }
      })
    
    }
}



const bodyProyectoFringeExpats = {

  //NumEmpleadoRrHh: this.form.value.num_empleado,
  NumProyecto: this.form.controls['proyecto'].value?.toString(),
  NumEmpleadoRrHh: this.form.controls['num_empleado'].value,
  IdBeneficio: "3007",
  nucostobeneficio: this.form.value.proy_fringe_expats
}

if(this.isProy_FringeExpats){
  this.empleadosService.ActualizaProyectoBeneficioCosto(bodyProyectoFringeExpats,"/3007/"+this.form.controls['num_empleado'].value)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      console.log("error cuando es 0 beneficio FRINGEEXPANTS --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
}else{

  if(this.form.value.proy_fringe_expats != 0 || this.form.value.proy_fringe_expats != 0.0 || this.form.value.proy_fringe_expats != 0.00){

    this.empleadosService.guardarProyectoBeneficioCosto(bodyProyectoFringeExpats)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          //this.form.reset()
          //this.ngOnInit
          //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
        }
      })
    
    }
}



const bodyProyectoProgramadeEntrenamiento = {

  //NumEmpleadoRrHh: this.form.value.num_empleado,
  NumProyecto: this.form.controls['proyecto'].value?.toString(),
  NumEmpleadoRrHh: this.form.controls['num_empleado'].value,
  IdBeneficio: "10",
  nucostobeneficio: this.form.value.proy_programa_de_entretenimiento
}

if(this.isProy_ProgramaDeEntretenimiento){
  this.empleadosService.ActualizaProyectoBeneficioCosto(bodyProyectoProgramadeEntrenamiento,"/10/"+this.form.controls['num_empleado'].value)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      console.log("error cuando es 0 beneficio PROGRAMADEENTRETENIMIENTO --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
}else{

  if(this.form.value.proy_programa_de_entretenimiento != 0 || this.form.value.proy_programa_de_entretenimiento != 0.0 || this.form.value.proy_programa_de_entretenimiento != 0.00){

    this.empleadosService.guardarProyectoBeneficioCosto(bodyProyectoProgramadeEntrenamiento)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          //this.form.reset()
          //this.ngOnInit
          //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
        }
      })
    
    }
}



const bodyProyectoEventosEspeciales = {

  //NumEmpleadoRrHh: this.form.value.num_empleado,
  NumProyecto: this.form.controls['proyecto'].value?.toString(),
  NumEmpleadoRrHh: this.form.controls['num_empleado'].value,
  IdBeneficio: "11",
  nucostobeneficio: this.form.value.proy_eventos_especiales
}

if(this.isProy_EventosEspeciales){
  this.empleadosService.ActualizaProyectoBeneficioCosto(bodyProyectoEventosEspeciales,"/11/"+this.form.controls['num_empleado'].value)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      console.log("error cuando es 0 beneficio EVENTOSESPECIALES --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
}else{

  if(this.form.value.proy_eventos_especiales != 0 || this.form.value.proy_eventos_especiales != 0.0 || this.form.value.proy_eventos_especiales != 0.00){

    this.empleadosService.guardarProyectoBeneficioCosto(bodyProyectoEventosEspeciales)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
         //this.form.reset()
          //this.ngOnInit
              //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
        }
      })
    
    }
}



const bodyProyectoCostoIT = {

  //NumEmpleadoRrHh: this.form.value.num_empleado,
  NumProyecto: this.form.controls['proyecto'].value?.toString(),
  NumEmpleadoRrHh: this.form.controls['num_empleado'].value,
  IdBeneficio: "1005",
  nucostobeneficio: this.form.value.proy_costo_it
}

if(this.isProy_CostoIt){
  this.empleadosService.ActualizaProyectoBeneficioCosto(bodyProyectoCostoIT,"/1005/"+this.form.controls['num_empleado'].value)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      console.log("error cuando es 0 beneficio COSTOIT --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
}else{

  if(this.form.value.proy_costo_it != 0 || this.form.value.proy_costo_it != 0.0 || this.form.value.proy_costo_it != 0.00){

    this.empleadosService.guardarProyectoBeneficioCosto(bodyProyectoCostoIT)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
         //this.form.reset()
          //this.ngOnInit
              //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
        }
      })
    
    }
}


const bodyProyectoCosto_telefonia = {

  //NumEmpleadoRrHh: this.form.value.num_empleado,
  NumProyecto: this.form.controls['proyecto'].value?.toString(),
  NumEmpleadoRrHh: this.form.controls['num_empleado'].value,
  IdBeneficio: "2005",
  nucostobeneficio: this.form.value.proy_costo_telefonia
}

if(this.isProy_CostoTelefonia){
  this.empleadosService.ActualizaProyectoBeneficioCosto(bodyProyectoCosto_telefonia,"/2005/"+this.form.controls['num_empleado'].value)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      console.log("error cuando es 0 beneficio TELEFONIA --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
}else{

  if(this.form.value.proy_costo_telefonia != 0 || this.form.value.proy_costo_telefonia != 0.0 || this.form.value.proy_costo_telefonia != 0.00){

    this.empleadosService.guardarProyectoBeneficioCosto(bodyProyectoCosto_telefonia)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          //this.form.reset()
          //this.ngOnInit
              //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
        }
      })
    
    }
}



const bodyProyectosSV_Directivos = {

  //NumEmpleadoRrHh: this.form.value.num_empleado,
  NumProyecto: this.form.controls['proyecto'].value?.toString(),
  NumEmpleadoRrHh: this.form.controls['num_empleado'].value,
  IdBeneficio: "3005",
  nucostobeneficio: this.form.value.proy_sv_directivos
}

if(this.isProy_SvDirectivos){
  this.empleadosService.ActualizaProyectoBeneficioCosto(bodyProyectosSV_Directivos,"/3005/"+this.form.controls['num_empleado'].value)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      console.log("error cuando es 0 beneficio SVDIRECTOS --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
}else{

  if(this.form.value.proy_sv_directivos != 0 || this.form.value.proy_sv_directivos != 0.0 || this.form.value.proy_sv_directivos != 0.00){

    this.empleadosService.guardarProyectoBeneficioCosto(bodyProyectosSV_Directivos)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          //this.form.reset()
          //this.ngOnInit
              //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
        }
      })
    
    }
}


const bodyProyectoFacturacion_BPM = {

  //NumEmpleadoRrHh: this.form.value.num_empleado,
  NumProyecto: this.form.controls['proyecto'].value?.toString(),
  NumEmpleadoRrHh: this.form.controls['num_empleado'].value,
  IdBeneficio: "3006",
  nucostobeneficio: this.form.value.proy_facturacion_bpm
}

if(this.isProy_FacturacionBpm){
  this.empleadosService.ActualizaProyectoBeneficioCosto(bodyProyectoFacturacion_BPM,"/3006/"+this.form.controls['num_empleado'].value)
  .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
  .subscribe({
    next: (data) => {
      //this.form.reset()
      //this.ngOnInit
      //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
    },
    error: (err) => {
      console.log("error cuando es 0 beneficio FACTURABPM --------------> " +err.error.text);
      this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })

      
    }
  })
}else{

  if(this.form.value.proy_facturacion_bpm != 0 || this.form.value.proy_facturacion_bpm != 0.0 || this.form.value.proy_facturacion_bpm != 0.00){

    this.empleadosService.guardarProyectoBeneficioCosto(bodyProyectoFacturacion_BPM)
      .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
      .subscribe({
        next: (data) => {
          //this.form.reset()
          //this.ngOnInit
              //this.router.navigate(['/costos/costo-empleado'], {queryParams: {success: true}});
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
        }
      })
    
    }
}









    let a_Sueldoinfla = Number(this.form.controls['sueldoBrutoInflacion'].value?.toString())

    this.activatedRoute.params
    .subscribe(({id}) => {
      if(id) {
        this.idEmpleado = id
        this.esActualizacion = true
        this.costosService.getCostoID(id)
          .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
          .subscribe({
            next: ({data}) => {

              this.arraybeneficio = data[0].beneficios
              this.arraybeneficiosProyectos = data[0].beneficiosproyecto
              const [costoR] = data
              this.costos = data

              this.Costomenualproy = 0

              const dato = this.arraybeneficio;
                 dato?.forEach(paso=>{
                     

                    if(paso.beneficio === "Bono Adicional"){

                     // this.bonoproyect_sueldobruto += +paso.costo
                      console.log("this.bonoproyect_sueldobruto beneficio-------------->> " +this.bonoproyect_sueldobruto);

                      
                      this.bonoproyect_sueldobruto_ImpuestoNOM += +paso.costo
                      
                    
                    }

                    if(paso.beneficio === "Ayuda de transporte"){

                      this.bonoproyect_sueldobruto_ImpuestoNOM += +paso.costo
                    
                    }

                    

                 })

                 //this.bonoproyect_sueldobruto = 0
                 const beneficiopryect = this.arraybeneficiosProyectos;
                 beneficiopryect?.forEach(paso=>{

                    if(paso.beneficio === "Bono Adicional"){

                      this.bonoproyect_sueldobruto_ImpuestoNOM += +paso.nucostobeneficio

                       this.bonoproyect_sueldobruto += +paso.nucostobeneficio

                       console.log("this.bonoproyect_sueldobruto proyecto beneficio-------------->> " +this.bonoproyect_sueldobruto);
                      
                    
                    }

                    if(paso.beneficio === "Viáticos a comprobar"){

                      this.bonoproyect_sueldobruto += +paso.nucostobeneficio
                      
                      
                    
                    }

                  
                 })
              //console.log("suma aguinaldoMontoProvisionMensual-------------->> " +data.map(empleado => (costoR.aguinaldoMontoProvisionMensual)));
              //console.log("suma pvProvisionMensual-------------->> " +data.map(empleado => (costoR.pvProvisionMensual)));
              //console.log("suma avgBonoAnualEstimado-------------->> " +data.map(empleado => (costoR.avgBonoAnualEstimado)));
              //console.log("suma avgBonoAnualEstimado-------------->> " +data.map(empleado => (costoR.avgBonoAnualEstimado)));
              

              this.bonoproyect_sueldobruto_ImpuestoNOM += +data.map(empleado => (costoR.aguinaldoMontoProvisionMensual))
              this.bonoproyect_sueldobruto_ImpuestoNOM += +data.map(empleado => (costoR.pvProvisionMensual))
              this.bonoproyect_sueldobruto_ImpuestoNOM += +data.map(empleado => (costoR.avgBonoAnualEstimado))
              this.bonoproyect_sueldobruto_ImpuestoNOM += +data.map(empleado => (costoR.avgBonoAnualEstimado))

              //console.log("this.bonoproyect_sueldobruto_ImpuestoNOM -------------->> " +this.bonoproyect_sueldobruto_ImpuestoNOM); 

              

            },
            error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
          })
      } 
  })

  this.delay(1200000);

  console.log('Inicio de la función de prueba.');
    this.sleep(120000);    //Dormimos la ejecución durante 2 Minutos
    console.log('Fin de la función de prueba.');
  
    console.log('Hello');
setTimeout(() => { this.guardarelCosto() }, 60000);
console.log('Goodbye!');


  

    
    
              
         // }
   
   /* this.empleadosService.guardarCostoEmpleadoActualiza(body,true,this.form.value.num_empleado)
    .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
    .subscribe({
      next: (data) => {
        this.form.reset()
        this.router.navigate(['/costos/captura-beneficios'], {queryParams: {success: true}});
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
      }
    })*/
    // console.log(body)
    
    

    
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async delay(ms: number) {
    await new Promise(resolve => setTimeout(()=>resolve, ms)).then(()=>console.log("fired"));
}

  guardarelCosto() {

    let body = {
      //...this.form.value
     
      idCostoEmpleado: null,
      NumEmpleadoRrHh: null,
      sueldoBruto: this.form.controls['sueldoBrutoInflacion'].value?.toString(),
      //sueldoBruto: a_Sueldoinfla + this.bonoproyect_sueldobruto,     
      numProyecto: this.form.controls['proyecto'].value?.toString() ,
      //sueldoBrutoInflacion: this.form.value.sueldoBrutoInflacion,
      vaidCostoMensual: this.form.value.vaidCostoMensual?.toString(),
      svCostoTotalAnual: this.form.value.svCostoTotalAnual?.toString(),
      sgmmCostoTotalAnual: this.form.value.sgmmCostoTotalAnual?.toString(),
      avgBonoAnualEstimado: this.form.value.avgBonoAnualEstimado?.toString(),
      CostoMensualProyecto:  this.Costomenualproy,
      bonoproyect_sueldobruto: this.bonoproyect_sueldobruto,
      cotizacion: this.cotizacion,
      bonoproyect_sueldobruto_ImpuestoNOM: this.bonoproyect_sueldobruto_ImpuestoNOM,
       //fecha_ingreso:          format(new Date(this.form.value.fecha_ingreso || null), 'Y/MM/dd'),
       //fecha_salida:           this.form.value.fecha_salida ? format(new Date(this.form.value.fecha_salida), 'Y/MM/dd') : null,
       //fecha_ultimo_reingreso: this.form.value.fecha_ultimo_reingreso ? format(new Date(this.form.value.fecha_ultimo_reingreso), 'Y/MM/dd') : null
 
     }
 
     this.empleadosServ.getCostoID(this.idEmpleado)
               .subscribe({
                 next: (data) => {
                   if (data.data.length > 0) {
                     body = {
                       ...body,
                       idCostoEmpleado: data.data[0].idCostoEmpleado,
                       NumEmpleadoRrHh: data.data[0].numEmpleadoRrHh,
 
 
                       
                     }
 
                    /* this.empleadosServ.guardarCostoEmpleadoActualiza(body, this.esActualizacion, "api/Costo/" + data.data[0].idCostoEmpleado)
                       .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
                       .subscribe(resp => {
                         Promise.resolve().then(() => this.messageService.add({ severity: 'success', summary: 'Registro guardado', detail: 'El registro ha sido guardado.' }))
                         this.form.reset()
                         this.router.navigate(['/costos/captura-beneficios'], { queryParams: { success: true } });
                        console.log(resp);
                      },
                      err => {
                       console.log(err);
                     },
                    );
                    }*/
 
                     this.empleadosServ.guardarCostoEmpleadoActualiza(body, this.esActualizacion, "api/Costo/" + data.data[0].idCostoEmpleado)
                       .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
                       .subscribe({
                         next: (datad) => {
                          
                           
                           //this.form.reset()
                           //this.router.navigate(['/costos/costo-empleado'], { queryParams: { success: true } });
 
                           this.Costomenualproy = 0
 
                           this.activatedRoute.params
                             .subscribe(({id}) => {
                               forkJoin([
                                 id ? this.empleadosServ.getPersonas() : this.empleadosServ.getPersonasDisponibles(),
                                 this.empleadosServ.getCatEmpleados(),
                                 this.empleadosServ.getCatCategorias(),
                                 this.empleadosServ.getCatTiposContratos(),
                                 this.empleadosServ.getCatNivelEstudios(),
                                 this.empleadosServ.getCatFormasPago(),
                                 this.empleadosServ.getCatJornadas(),
                                 this.empleadosServ.getCatDepartamentos(),
                                 this.empleadosServ.getCatClasificacion(),
                                 this.empleadosServ.getCatUnidadNegocio(),
                                 this.empleadosServ.getCatTurno(),
                                 this.empleadosServ.getHabilidades(),
                                 this.empleadosServ.getExperiencias(),
                                 this.empleadosServ.getProfesiones(),
                                 this.empleadosServ.getPuestos(),
                                 this.empleadosServ.getEmpleados(),
                                 this.empleadosServ.getCatEstados(),
                                 this.empleadosServ.getCatPaises(),
                                 this.empleadosServ.getProyectos(),
                               ])
                               .pipe(finalize(() => this.verificarActualizacion()))
                               .subscribe({
                                 next: ([
                                   empleadosR,proyectosR
                                 ]) => {
                                   this.empleados = empleadosR.data.map(empleado => ({name: empleado.chnombre, code: empleado.chap_materno}))
                                   this.proyectos = proyectosR.data.map(proyecto => ({name: proyecto.num_proyecto_principal, code: proyecto.chproyecto_principal}))
                                 },
                                 error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
                               })
                             })
                         
                             
                         
                             
                         
                             this.empleadosService.getEmpleados()
                               .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
                               .subscribe({
                                 next: ({data}) => {
                                   this.empleados = data.map(empleado => ({name: empleado.nombre_persona, code: empleado.nunum_empleado_rr_hh.toString()}))
                                   
                                   //NumEmpleado = this.empleados.num_empleado_rr_hh as any
                                 },
                                 error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: err.error})
                               })
                                                   
                          
                         },
                         error: (err) => {
                           //Promise.resolve().then(() => this.messageService.add({ severity: 'success', summary: 'Registro guardado', detail: 'El registro ha sido guardado.' }))
                           if(err.error.text.includes('Actualización del registro de costos:') ){
                             Promise.resolve().then(() => this.messageService.add({ severity: 'success', summary: 'Registro guardado', detail: 'El registro ha sido guardado.' }))
 
                             this.Costomenualproy = 0
 
                             this.activatedRoute.params
                             .subscribe(({id}) => {
                               forkJoin([
                                 id ? this.empleadosServ.getPersonas() : this.empleadosServ.getPersonasDisponibles(),
                                 this.empleadosServ.getCatEmpleados(),
                                 this.empleadosServ.getCatCategorias(),
                                 this.empleadosServ.getCatTiposContratos(),
                                 this.empleadosServ.getCatNivelEstudios(),
                                 this.empleadosServ.getCatFormasPago(),
                                 this.empleadosServ.getCatJornadas(),
                                 this.empleadosServ.getCatDepartamentos(),
                                 this.empleadosServ.getCatClasificacion(),
                                 this.empleadosServ.getCatUnidadNegocio(),
                                 this.empleadosServ.getCatTurno(),
                                 this.empleadosServ.getHabilidades(),
                                 this.empleadosServ.getExperiencias(),
                                 this.empleadosServ.getProfesiones(),
                                 this.empleadosServ.getPuestos(),
                                 this.empleadosServ.getEmpleados(),
                                 this.empleadosServ.getCatEstados(),
                                 this.empleadosServ.getCatPaises(),
                                 this.empleadosServ.getProyectos(),
                               ])
                               .pipe(finalize(() => this.verificarActualizacion()))
                               .subscribe({
                                 next: ([
                                   empleadosR,proyectosR
                                 ]) => {
                                   this.empleados = empleadosR.data.map(empleado => ({name: empleado.chnombre, code: empleado.chap_materno}))
                                   this.proyectos = proyectosR.data.map(proyecto => ({name: proyecto.num_proyecto_principal, code: proyecto.chproyecto_principal}))
                                 },
                                 error: (err) => this.messageService.add({ severity: 'error', summary: TITLES.error, detail: err.error })
                               })
                             })
                         
                             
                         
                             
                         
                             this.empleadosService.getEmpleados()
                               .pipe(finalize(() => this.sharedService.cambiarEstado(false)))
                               .subscribe({
                                 next: ({data}) => {
                                   this.empleados = data.map(empleado => ({name: empleado.nombre_persona, code: empleado.nunum_empleado_rr_hh.toString()}))
                                   
                                   //NumEmpleado = this.empleados.num_empleado_rr_hh as any
                                 },
                                 error: (err) => this.messageService.add({severity: 'error', summary: TITLES.error, detail: err.error})
                               })
 
                             //console.log("Errores = "+ err.error.text)
                           }else{
                             this.messageService.add({ severity: 'error Actualiza', summary: TITLES.error, detail: err.error.message })
                             //console.log("Diferente error: "+ err.error.text)
                           }
                          
                           
                         }
                       })
                   }
 
                   this.bonoproyect_sueldobruto = 0
                   this.bonoproyect_sueldobruto_ImpuestoNOM = 0
                   Promise.resolve().then(() => this.messageService.add({ severity: 'success', summary: 'Registro guardado', detail: 'El registro ha sido guardado.' }))
 
                   this.cargando = false
                 }
                 
                 ,
                 error: (err) => {
                   this.messageService.add({ severity: 'error Obtener CostoID', summary: TITLES.error, detail: err.error })
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

  formateaValor(valor) {
    // si no es un número devuelve el valor, o lo convierte a número con 4 decimales
    return isNaN(valor) ? valor : parseFloat(valor).toFixed(2);
  }

}
 

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { AccordionModule } from 'primeng/accordion';
import { MessagesModule } from 'primeng/messages';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';

import { PcsRoutingModule } from './pcs-routing.module';

import { IpComponent } from './components/ip/ip.component';
import { PcsComponent } from './container/pcs.component';
import { StaffingPlanComponent } from './components/staffing-plan/staffing-plan.component';
import { GastosComponent } from './components/gastos/gastos.component';
import { IngresosComponent } from './components/ingresos/ingresos.component';
import { ControlComponent } from './components/control/control.component';
import { PpaKpiComponent } from './components/ppa-kpi/ppa-kpi.component';
import { PrimengModule } from '../shared/primeng.module';
import { TabMenuModule } from 'primeng/tabmenu';
import { SeleccionarEmpleadoComponent } from './components/seleccionar-empleado/seleccionar-empleado.component';
import { CheckboxModule } from 'primeng/checkbox';
import { SeleccionarFechaComponent } from './components/seleccionar-fecha/seleccionar-fecha.component';
import { TimelineModule } from 'primeng/timeline';
import { CrearEtapaComponent } from './components/crear-etapa/crear-etapa.component';
import { ButtonModule } from 'primeng/button';
import { AgregarEmpleadoComponent } from './components/agregar-empleado/agregar-empleado.component';
import { ModificarEmpleadoComponent } from './components/modificar-empleado/modificar-empleado.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PorcentajeMesPipe } from './pipes/porcentaje-mes.pipe';
import { ValorMesPipe } from './pipes/valor-mes.pipe';
import { ModificarRubroComponent } from './components/modificar-rubro/modificar-rubro.component';
import { InputSwitchModule } from 'primeng/inputswitch';
import { CalcularSubtotalPipe } from './pipes/calcular-subtotal.pipe';
import { calcularSubtotalStaffingPipe } from './pipes/calcular-subtotal-staffing.pipe';
import { CalcularSubtotalIngresoPipe } from './pipes/calcular-subtotal-ingreso.pipe';
import { PorcentajeMesIngresoPipe } from './pipes/porcentaje-mes-ingreso.pipe';
import { MultiSelectModule } from 'primeng/multiselect';
import { PorcentajeMesFacturaPipe } from './pipes/porcentaje-mes-factura.pipe';
import { PorcentajeMesCobranzaPipe } from './pipes/porcentaje-mes-cobranza.pipe';
import { porcentajeMesControlPipe } from './pipes/porcentaje-mes-control.pipe';
import { TablaDatosComponent } from './components/tabla-datos/tabla-datos.component';
import { SubseccionesAccordionComponent } from './components/subsecciones-accordion/subsecciones-accordion.component';
import { porcentajeMesStaffingPipe } from './pipes/porcentaje-mes-staffing.pipe';
import { SeccionContenidoComponent } from './components/seccion-contenido/seccion-contenido.component';
import { ModificarEtapaComponent } from './components/modificar-etapa/modificar-etapa.component';
import { TotalesIngresosComponent } from './components/totales-ingresos/totales-ingresos.component';


@NgModule({
  declarations: [
    IpComponent,
    PcsComponent,
    StaffingPlanComponent,
    GastosComponent,
    IngresosComponent,
    ControlComponent,
    PpaKpiComponent,
    SeleccionarEmpleadoComponent,
    SeleccionarFechaComponent,
    CrearEtapaComponent,
    AgregarEmpleadoComponent,
    ModificarEmpleadoComponent,
    PorcentajeMesPipe,
    ValorMesPipe,
    ModificarRubroComponent,
    CalcularSubtotalPipe,
    calcularSubtotalStaffingPipe,
    CalcularSubtotalIngresoPipe,
    PorcentajeMesIngresoPipe,
    PorcentajeMesFacturaPipe,
    PorcentajeMesCobranzaPipe,
    porcentajeMesControlPipe,
    TablaDatosComponent,
    SubseccionesAccordionComponent,
    porcentajeMesStaffingPipe,
    SeccionContenidoComponent,
    ModificarEtapaComponent,
    TotalesIngresosComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    PcsRoutingModule,
    ToastModule,
    AccordionModule,
    MessagesModule,
    DropdownModule,
    CalendarModule,
    ReactiveFormsModule,
    PrimengModule,
    TabMenuModule,
    CheckboxModule,
    TimelineModule,
    ButtonModule,
    ProgressSpinnerModule,
    InputSwitchModule,
    MultiSelectModule
  ],
  providers: [ConfirmationService, MessageService]
})
export class PcsModule { }

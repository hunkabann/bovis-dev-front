import { Component, OnInit, inject } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { AuditoriaService } from '../../services/auditoria.service';
import { UserService } from 'src/app/services/user.service';

interface Tab {
  label: string;
  routerLink: string;
  id: string;
}

@Component({
  selector: 'app-auditoria-calidad',
  templateUrl: './auditoria-calidad.component.html',
  styleUrls: ['./auditoria-calidad.component.css']
})
export class AuditoriaCalidadComponent implements OnInit {

  activadedRoute    = inject(ActivatedRoute)
  auditoriaService  = inject(AuditoriaService)
  userService       = inject(UserService)
  router            = inject(Router)

  items: MenuItem[] = []

  activeItem: MenuItem;
  tienePermiso: boolean = false

  constructor() { }

  ngOnInit(): void {
    let tabs = []

    const tabsLegal = [
      { label: 'Seleccionar documentos del proyecto', routerLink: 'seleccionar', id: 'auditoria.auditoria-legal-seleccionar', queryParams: {tipo: 'legal'} },
      { label: 'Carga de documentos', routerLink: 'cargar', id: 'auditoria.auditoria-legal-cargar', queryParams: {tipo: 'legal'} },
      { label: 'Seguimiento de auditoria', routerLink: 'seguimiento', id: 'auditoria.auditoria-legal-seguimiento', queryParams: {tipo: 'legal'} },
    ]

    const tabsCalidad = [
      { label: 'Seleccionar documentos del proyecto', routerLink: 'seleccionar', id: 'auditoria.auditoria-de-calidad-seleccionar' },
      { label: 'Carga de documentos', routerLink: 'cargar', id: 'auditoria.auditoria-de-calidad-cargar' },
      { label: 'Seguimiento de auditoria', routerLink: 'seguimiento', id: 'auditoria.auditoria-de-calidad-seguimiento' },
    ]

    this.userService.isLoading = true

    this.activadedRoute.queryParams.subscribe(data => {
      if(data['tipo'] && data['tipo'] === 'legal') {
        tabs = tabsLegal
        this.items = tabs
        this.items = this.items.map(item => ({...item, queryParams: {tipo: data['tipo']}}))
        this.auditoriaService.esLegal = true
        if(!localStorage.getItem('esLegal')) {
          localStorage.setItem('esLegal', '1')
          window.location.reload()
        }
      } else {
        tabs = tabsCalidad
        this.items = tabs
        this.items = this.items.map(item => ({...item, queryParams: {tipo: null}}))
        this.auditoriaService.esLegal = false
        if(localStorage.getItem('esLegal')) {
          localStorage.removeItem('esLegal')
          window.location.reload()
        }
      }

      this.verificarTab(tabs)
    })
  }

  verificarTab(tabs: Tab[]) {
    this.userService.getRolesRealTime()
      .subscribe(data => {
        this.tienePermiso = false
        this.items = tabs.filter(tab => {
          const rolValido = this.userService.verificarRolTabs(tab.id)
          
          if(!this.tienePermiso && rolValido && window.location.href.includes(tab.routerLink)) {
            this.tienePermiso = true
          }

          return rolValido
        })

        if(!this.tienePermiso) {
          if(this.items.length > 0) {
            this.router.navigate([`/auditoria/${this.items[0].routerLink}`], {queryParams: {tipo: this.auditoriaService.esLegal ? 'legal' : null}})
          } else {
            this.router.navigate([`/`])
          }
        }
        this.userService.isLoading = false
      })
  }

  onActiveItemChange(event: any){
    this.activeItem = event
  }

}

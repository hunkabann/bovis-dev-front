import { Component, OnInit, inject } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { AuditoriaService } from '../../services/auditoria.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-auditoria-calidad',
  templateUrl: './auditoria-calidad.component.html',
  styleUrls: ['./auditoria-calidad.component.css']
})
export class AuditoriaCalidadComponent implements OnInit {

  activadedRoute    = inject(ActivatedRoute)
  auditoriaService  = inject(AuditoriaService)
  userService       = inject(UserService)

  items: MenuItem[] = []

  activeItem: MenuItem;

  constructor() { }

  ngOnInit(): void {
    const tabs = [
      { label: 'Seleccionar documentos del proyecto', routerLink: 'seleccionar', id: 'auditoria.auditoria-legal-seleccionar' },
      { label: 'Carga de documentos', routerLink: 'cargar', id: 'auditoria.auditoria-legal-cargar' },
      { label: 'Seguimiento de auditoria', routerLink: 'seguimiento', id: 'auditoria.auditoria-legal-seguimiento' },
    ]

    this.items = tabs
    this.userService.getRolesRealTime()
      .subscribe(data => {
        // this.items = tabs.filter(tab => this.userService.verificarRol(tab.id))
        this.userService.isLoading = false
      })

    this.activadedRoute.queryParams.subscribe(data => {
      if(data['tipo'] && data['tipo'] === 'legal') {
        this.items = this.items.map(item => ({...item, queryParams: {tipo: data['tipo']}}))
        this.auditoriaService.esLegal = true
        if(!localStorage.getItem('esLegal')) {
          localStorage.setItem('esLegal', '1')
          window.location.reload()
        }
      } else {
        this.items = this.items.map(item => ({...item, queryParams: {tipo: null}}))
        this.auditoriaService.esLegal = false
        if(localStorage.getItem('esLegal')) {
          localStorage.removeItem('esLegal')
          window.location.reload()
        }
      }
    })
  }

  onActiveItemChange(event: any){
    this.activeItem = event
  }

}

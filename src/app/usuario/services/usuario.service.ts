import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { environment } from 'src/environments/environment';
import { ModulosArbolResponse, ModulosResponse, PerfilModulosArbolResponse, PerfilModulosResponse, PerfilPermisosResponse, PerfilesResponse, PermisosResponse, UsuarioPerfilesResponse, UsuariosResponse } from '../models/usuario.model';
import { GenericResponse } from 'src/app/empleados/Models/empleados';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  baseUrl = environment.urlApiBovis;

  http = inject(HttpClient)

  constructor() { }

  obtenerUsuarios () {
    return this.http.get<UsuariosResponse>(`${this.baseUrl}api/Autorizacion/Usuarios`)
  }

  obtenerPerfiles() {
    return this.http.get<PerfilesResponse>(`${this.baseUrl}api/Autorizacion/Perfiles`)
  }

  obtenerUsuarioPerfiles(usuarioId: number) {
    return this.http.get<UsuarioPerfilesResponse>(`${this.baseUrl}api/Autorizacion/Usuario/${usuarioId}/Perfiles`)
  }

  obtenerModulos() {
    return this.http.get<ModulosResponse>(`${this.baseUrl}api/Autorizacion/Modulos`)
  }

  obtenerModulosArbol() {
    return this.http.get<ModulosArbolResponse>(`${this.baseUrl}api/Autorizacion/Modulos`)
  }

  obtenerPerfilModulos(moduloId: number) {
    return this.http.get<PerfilModulosResponse>(`${this.baseUrl}api/Autorizacion/Perfil/${moduloId}/Modulos`)
  }

  obtenerPerfilModulosArbol(moduloId: number) {
    return this.http.get<PerfilModulosArbolResponse>(`${this.baseUrl}api/Autorizacion/Perfil/${moduloId}/Modulos`)
  }

  obtenerPermisos() {
    return this.http.get<PermisosResponse>(`${this.baseUrl}api/Autorizacion/Permisos`)
  }

  obtenerPerfilPermisos(moduloId: number) {
    return this.http.get<PerfilPermisosResponse>(`${this.baseUrl}api/Autorizacion/Perfil/${moduloId}/Permisos`)
  }

  guardarPerfil(body: any) {
    return this.http.post<GenericResponse>(`${this.baseUrl}api/Autorizacion/Perfiles`, body)
  }

  actualizarUsuarioPerfiles(body: any) {
    return this.http.put<GenericResponse>(`${this.baseUrl}api/Autorizacion/Usuario/Perfiles`, body)
  }

  actualizarPerfilModulos(body: any) {
    return this.http.put<GenericResponse>(`${this.baseUrl}api/Autorizacion/Perfil/Modulos`, body)
  }

  actualizarPerfilPermisos(body: any) {
    return this.http.put<GenericResponse>(`${this.baseUrl}api/Autorizacion/Perfil/Permisos`, body)
  }

  eliminarUsuario(id: number) {
    return this.http.delete<GenericResponse>(`${this.baseUrl}api/Autorizacion/Usuarios/${id}`)
  }

  eliminarPerfil(id: number) {
    return this.http.delete<GenericResponse>(`${this.baseUrl}api/Autorizacion/Perfiles/${id}`)
  }
}

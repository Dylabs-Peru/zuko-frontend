import { Injectable } from '@angular/core';
import { ApiService } from './Api.service';
import { CreateRoleRequest, RoleResponse } from '../models/role.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private endpoint = '/roles';

  constructor(private api: ApiService) {}

  createRole(request: CreateRoleRequest): Observable<RoleResponse> {
    return this.api.post<RoleResponse>(this.endpoint, request);
  }

  getAllRoles(): Observable<RoleResponse[]> {
    return this.api.get<RoleResponse[]>(this.endpoint);
  }

  updateRole(id: number, request: CreateRoleRequest): Observable<RoleResponse> {
    return this.api.put<RoleResponse>(`${this.endpoint}/${id}`, request);
  }

  deleteRole(id: number): Observable<void> {
    return this.api.delete(`${this.endpoint}/${id}`);
  }
}

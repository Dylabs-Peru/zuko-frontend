import { Injectable } from '@angular/core';
import { ApiService } from  './Api.service';
import {
  CreateUserRequest,
  LoginRequest,
  UpdateUserRequest,
  UserResponse,
  AuthResponse,
  GoogleOAuthRequest
} from '../models/user.model';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  private endpoint = '/users';

  constructor(private apiService: ApiService) {}

  createUser(request: CreateUserRequest): Observable<UserResponse> {
    return this.apiService.post<UserResponse>(`${this.endpoint}/signup`, request);
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>(`${this.endpoint}/login`, request);
  }

  getAllUsers(): Observable<UserResponse[]> {
    return this.apiService.get<UserResponse[]>(this.endpoint);
  }
  getUserById(id: number): Observable<UserResponse> {
    return this.apiService.get<UserResponse>(`${this.endpoint}/${id}`);
  }

  toggleUserActiveStatus(id: number): Observable<string> {
    return this.apiService.patch<string>(`${this.endpoint}/${id}/toggle-active`, {});
  }

  updateUser(id: number, request: UpdateUserRequest): Observable<UserResponse> {
    return this.apiService.patch<UserResponse>(`${this.endpoint}/${id}`, request);
  }
  
  getUserByUsername(username: string): Observable<UserResponse> {
    return this.apiService.get<UserResponse>(`${this.endpoint}/username/${username}`);
  }

  /**
   * Busca usuarios por nombre de usuario para la funcionalidad de búsqueda
   * La búsqueda es case-insensitive y se filtra adicionalmente en el frontend
   * @param username Término de búsqueda para el nombre de usuario
   * @returns Lista de usuarios que coinciden con el término de búsqueda
   */
  searchUsersByUsername(username: string): Observable<UserResponse[]> {
    const encodedUsername = encodeURIComponent(username);
    return this.apiService.get<UserResponse[]>(`${this.endpoint}/search?username=${encodedUsername}`);
  }

  // Métodos específicos para Google OAuth
  loginWithGoogle(request: GoogleOAuthRequest): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>(`${this.endpoint}/google/login`, request);
  }

  registerWithGoogle(request: GoogleOAuthRequest): Observable<any> {
    return this.apiService.post<any>(`${this.endpoint}/google/register`, request);
  }

  

}

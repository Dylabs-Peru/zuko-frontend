import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './Api.service';
import { CreateArtistRequest, UpdateArtistRequest, ArtistResponse } from '../models/artist.model';

@Injectable({
  providedIn: 'root'
})
export class ArtistService {
  private endpoint = '/artists';

  constructor(private apiService: ApiService) {}

 // Crear artista
 createArtist(username: string, request: CreateArtistRequest): Observable<ArtistResponse> {
    console.log('Username:', username); // Agrega este log
    console.log('Request:', request);
    return this.apiService.post<ArtistResponse>(`${this.endpoint}/${username}`, request);
  }

  // Actualizar artista
  updateArtist(id: number, request: UpdateArtistRequest): Observable<ArtistResponse> {
    return this.apiService.put<ArtistResponse>(`${this.endpoint}/${id}`, request);
  }

  // Listar todos los artistas
  getAllArtists(): Observable<ArtistResponse[]> {
    return this.apiService.get<ArtistResponse[]>(this.endpoint);
  }

  // Buscar artistas por nombre
  searchArtistsByName(name: string): Observable<ArtistResponse[]> {
    return this.apiService.get<ArtistResponse[]>(`${this.endpoint}/search?name=${encodeURIComponent(name)}`);
  }

  // Obtener artista por ID
  getArtistById(id: number): Observable<ArtistResponse> {
    return this.apiService.get<ArtistResponse>(`${this.endpoint}/${id}`);
  }

  getArtistByName(name: string): Observable<ArtistResponse> {
    return this.apiService.get<ArtistResponse>(`${this.endpoint}/${name}`);
  }
  // Cambiar estado activo/inactivo
  toggleArtistActiveStatus(id: number): Observable<string> {
    return this.apiService.patch<string>(`${this.endpoint}/${id}/toggle-active`, {});
  }
}
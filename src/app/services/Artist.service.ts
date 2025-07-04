import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './Api.service';
import { CreateArtistRequest, UpdateArtistRequest, ArtistResponse } from '../models/artist.model';

@Injectable({
  providedIn: 'root'
})
export class ArtistService {
   
    getArtistByName(name: string): Observable<ArtistResponse[]> {
        return this.apiService.get<ArtistResponse[]>(`/artists/search?name=${encodeURIComponent(name)}`);
    }

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
    return this.apiService.get<{ message: string, data: ArtistResponse[] }>(this.endpoint)
      .pipe(map((res: { message: string, data: ArtistResponse[] }) => res.data));
  }

  // Buscar artistas por nombre
  searchArtistsByName(name: string): Observable<ArtistResponse[]> {
    return this.apiService.get<ArtistResponse[]>(`${this.endpoint}/search?name=${encodeURIComponent(name)}`);
  }

  // Obtener artista por ID
  getArtistById(id: number): Observable<ArtistResponse> {
    return this.apiService.get<ArtistResponse>(`${this.endpoint}/${id}`);
  }

  // Cambiar estado activo/inactivo
  toggleArtistActiveStatus(id: number): Observable<string> {
    return this.apiService.patch<string>(`${this.endpoint}/${id}/toggle-active`, {});
  }
}
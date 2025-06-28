import { Injectable } from '@angular/core';
import { Observable,map } from 'rxjs';
import { AlbumRequest, AlbumResponse } from '../models/album.model';
import { ApiService } from './Api.service';

@Injectable({ providedIn: 'root' })
export class AlbumService {
  // Obtener álbumes por artistId (perfil de otro artista)
  getAlbumsByArtist(artistId: number): Observable<AlbumResponse[]> {
    return this.apiService.get<AlbumResponse[]>(`${this.endpoint}/by-artist/${artistId}`);
  }
  private endpoint = '/albums';

  constructor(private apiService: ApiService) {}

  // Crear álbum
  createAlbum(request: AlbumRequest): Observable<any> {
    return this.apiService.post<any>(`${this.endpoint}`, request);
  }

  // Obtener álbum por ID
  getAlbumById(id: number): Observable<any> {
    return this.apiService.get<any>(`${this.endpoint}/${id}`);
  }

  // Buscar álbumes por título
  getAlbumsByTitle(title: string): Observable<any> {
    return this.apiService.get<any>(`${this.endpoint}/search?title=${encodeURIComponent(title)}`);
  }

  // Buscar álbumes por título y usuario/artista
  getAlbumsByTitleAndUser(title: string): Observable<any> {
    return this.apiService.get<any>(`${this.endpoint}/search/artist?title=${encodeURIComponent(title)}`);
  }

  // Listar todos los álbumes
  getAllAlbums(): Observable<any> {
    return this.apiService.get<any>(`${this.endpoint}`);
  }

  // Actualizar álbum
  updateAlbum(id: number, request: AlbumRequest): Observable<any> {
    return this.apiService.put<any>(`${this.endpoint}/${id}`, request);
  }

  // Eliminar álbum
  deleteAlbum(id: number): Observable<any> {
    return this.apiService.delete(`${this.endpoint}/${id}`);
  }

  getAlbumBySongId(songId: number): Observable<AlbumResponse> {
    return this.apiService.get<{data: AlbumResponse}>(`${this.endpoint}/from-song/${songId}`)
      .pipe(map(response => response.data));
  }
}

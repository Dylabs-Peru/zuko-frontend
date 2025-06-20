import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { GenreResponse, GenreRequest } from '../models/genre.model';
import { ApiService } from './Api.service';

@Injectable({
  providedIn: 'root'
})
export class GenreService {
  private endpoint = '/genres';

  constructor(private api: ApiService) {}

  get_genres(): Observable<GenreResponse[]> {
    return this.api.get<{ data: GenreResponse[] }>(this.endpoint)
      .pipe(map(response => response.data));
  }

  create_genre(genre: GenreRequest): Observable<GenreResponse> {
    return this.api.post<GenreResponse>(this.endpoint, genre);
  }

  update_genre(id: number, genre: GenreRequest): Observable<GenreResponse> {
    return this.api.put<GenreResponse>(`${this.endpoint}/${id}`, genre);
  }

  delete_genre(id: number): Observable<void> {
    return this.api.delete(`${this.endpoint}/${id}`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { GenreResponse, GenreRequest } from './genre.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GenreService {
  private baseUrl = `${environment.apiUrl}/genres`;
  constructor(private http: HttpClient) {}

  get_genres(): Observable<GenreResponse[]> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.get<{data:GenreResponse[]}>(this.baseUrl, {headers}).pipe(map(response => response.data));
  }

  create_genre(genre: GenreRequest): Observable<GenreResponse> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.post<GenreResponse>(this.baseUrl, genre, { headers });
  }

  update_genre(id: number, genre: GenreRequest): Observable<GenreResponse> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.put<GenreResponse>(`${this.baseUrl}/${id}`, genre, { headers });
  }

  delete_genre(id: number): Observable<void> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers });
  }

}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
    return this.http.get<{data:GenreResponse[]}>(this.baseUrl).pipe(map(response => response.data));
  }
  
}

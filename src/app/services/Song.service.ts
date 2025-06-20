import { Injectable } from '@angular/core';
import {SongResponse, SongRequest } from '../models/song.model';
import { ApiService } from './Api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SongService {
  private endpoint = '/songs';

  constructor(private api: ApiService) {}

  getMySongs(): Observable<SongResponse[]> {
    return this.api.get<SongResponse[]>(this.endpoint);
  }

  createSong(song: SongRequest): Observable<SongResponse> {
    return this.api.post<SongResponse>(this.endpoint, song);
  }

  updateSong(id: number, song: SongRequest): Observable<SongResponse> {
    return this.api.put<SongResponse>(`${this.endpoint}/${id}`, song);
  }

  deleteSong(id: number): Observable<void> {
    return this.api.delete(`${this.endpoint}/${id}`);
  }
}

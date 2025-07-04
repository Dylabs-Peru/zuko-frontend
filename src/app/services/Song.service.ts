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

  searchPublicSongsByTitle(title: string): Observable<SongResponse[]> {
    return this.api.get<SongResponse[]>(`/songs/search?title=${encodeURIComponent(title)}`);
  }

  getSongsByArtist(artistId: number): Observable<SongResponse[]> {
    return this.api.get<SongResponse[]>(`${this.endpoint}/by-artist?artistId=${artistId}`);
  }

  getSongById(id: number): Observable<SongResponse> {
    return this.api.get<SongResponse>(`/songs/${id}`);
  }

  getAllSongs(): Observable<SongResponse[]> {
    return this.api.get<SongResponse[]>('/songs/all');
  }

  getTop3PublicSongs(): Observable<SongResponse[]> {
  return this.api.get<SongResponse[]>('/songs/top3-latest');
  }
}

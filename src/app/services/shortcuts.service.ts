import { AddPlaylistToShortcutsRequest, AddAlbumToShortcutsRequest, ShortcutsResponse, AlbumSummaryResponse } from './../models/shortcuts.model';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './Api.service';
import { BehaviorSubject } from 'rxjs';
import { PlaylistSummaryResponse } from '../models/playlist.model';

@Injectable({
   providedIn: 'root'
})
export class ShortcutsService {
  private playlistsSubject = new BehaviorSubject<PlaylistSummaryResponse[]>([]);
  private albumsSubject = new BehaviorSubject<AlbumSummaryResponse[]>([]);
  
  playlists$ = this.playlistsSubject.asObservable();
  albums$ = this.albumsSubject.asObservable();
  private endpoint = '/shortcuts';
  constructor(private api: ApiService) {}

  addPlaylistToShortcuts(request: AddPlaylistToShortcutsRequest): Observable<ShortcutsResponse> {
    return this.api.post<{ data: ShortcutsResponse }>(this.endpoint, request)
      .pipe(map(response => response.data));
  }

  removePlaylistFromShortcuts(playlistId: number): Observable<void> {
    return this.api.delete(`${this.endpoint}/${playlistId}`);
  }

  getShortcutsByUser(): Observable<ShortcutsResponse> {
    return this.api.get<{ data: ShortcutsResponse }>(this.endpoint)
      .pipe(map(response => {
         this.playlistsSubject.next(response.data.Playlists)
        return  response.data
      })
    );
  }
  getCurrentShortcutsPlaylists(): PlaylistSummaryResponse[] {
    return this.playlistsSubject.value;
  }

  addAlbumToShortcuts(request: AddAlbumToShortcutsRequest): Observable<ShortcutsResponse> {
    return this.api.post<{ data: ShortcutsResponse }>(`${this.endpoint}/albums?albumId=${request.albumId}`, {})
      .pipe(map(response => {
        this.albumsSubject.next(response.data.Albums || []);
        return response.data;
      }));
  }

  removeAlbumFromShortcuts(albumId: number): Observable<void> {
    return this.api.delete(`${this.endpoint}/albums/${albumId}`).pipe(
      map(() => {
        const currentAlbums = this.albumsSubject.value;
        const updatedAlbums = currentAlbums.filter(album => album.id !== albumId);
        this.albumsSubject.next(updatedAlbums);
      })
    );
  }

  getCurrentShortcutsAlbums(): AlbumSummaryResponse[] {
    return this.albumsSubject.value;
  }

  // Actualizar tanto playlists como álbumes al obtener los accesos directos
  private updateShortcutsData(data: ShortcutsResponse): void {
    this.playlistsSubject.next(data.Playlists || []);
    this.albumsSubject.next(data.Albums || []);
  }
}



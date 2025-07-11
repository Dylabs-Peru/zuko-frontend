import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { PlaylistResponse, PlaylistRequest, UpdatePlaylistRequest } from '../models/playlist.model';
import { SongResponse } from '../models/song.model';
import { ApiService } from './Api.service';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  private endpoint = '/playlists';

  constructor(private api: ApiService) {}

  // 1. Crear playlist
  createPlaylist(request: PlaylistRequest): Observable<PlaylistResponse> {
    return this.api.post<{ data: PlaylistResponse }>(this.endpoint, request)
      .pipe(map(response => response.data));
  }

  // 2. Obtener playlist por ID (autenticado)
  getPlaylistById(playlistId: number): Observable<PlaylistResponse> {
    return this.api.get<{ data: PlaylistResponse }>(`${this.endpoint}/${playlistId}`)
      .pipe(map(response => response.data));
  }

  // 3. Eliminar playlist
  deletePlaylist(playlistId: number): Observable<void> {
    return this.api.delete(`${this.endpoint}/${playlistId}`);
  }

  // 4. Listar canciones en playlist
  listSongsInPlaylist(playlistId: number): Observable<SongResponse[]> {
    return this.api.get<{ data: SongResponse[] }>(`${this.endpoint}/${playlistId}/songs`)
      .pipe(map(response => response.data));
  }

  // 5. Agregar canción a playlist
  addSongToPlaylist(playlistId: number, songId: number): Observable<void> {
    return this.api.post<void>(`${this.endpoint}/${playlistId}/songs`, { songId });
  }

  // 6. Eliminar canción de playlist
  removeSongFromPlaylist(playlistId: number, songId: number): Observable<void> {
    return this.api.delete(`${this.endpoint}/${playlistId}/songs/${songId}`);
  }

  // 7. Obtener playlist pública por nombre
 getPublicPlaylistsByName(name: string): Observable<PlaylistResponse[]> {
  return this.api.get<{ data: PlaylistResponse[] }>(`${this.endpoint}/public/search?name=${encodeURIComponent(name)}`)
    .pipe(map(response => response.data));
}

  // 8. Obtener playlist propia por nombre (autenticado)
  getPlaylistByName(playlistName: string): Observable<PlaylistResponse> {
    return this.api.get<{ data: PlaylistResponse }>(`${this.endpoint}/by-name/${playlistName}`)
      .pipe(map(response => response.data));
  }

  // 9. Obtener todas mis playlists
  getMyPlaylists(): Observable<PlaylistResponse[]> {
    return this.api.get<{ data: PlaylistResponse[] }>(`${this.endpoint}/mine`)
      .pipe(map(response => response.data));
  }

  updatePlaylist(playlistId: number, request: UpdatePlaylistRequest): Observable<PlaylistResponse> {
    return this.api.patch<{ data: PlaylistResponse }>(`${this.endpoint}/${playlistId}`, request)
      .pipe(map(response => response.data));
  }

  searchMyPlaylistsByName(query: string): Observable<PlaylistResponse[]> {
    return this.api.get<{ data: PlaylistResponse[] }>(
      `${this.endpoint}/mine/search?name=${encodeURIComponent(query)}`
    ).pipe(map(res => res.data));
  }

}
  


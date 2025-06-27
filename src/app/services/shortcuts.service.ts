import { AddPlaylistToShortcutsRequest, ShortcutsResponse } from './../models/shortcuts.model';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './Api.service';

@Injectable({
   providedIn: 'root'
})
export class ShortcutsService {
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
      .pipe(map(response => response.data));
  }
}



import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ReleaseItem } from '../models/release.model';

@Injectable({
  providedIn: 'root'
})
export class ReleaseService {
  private apiUrl = 'http://localhost:8080/api/v1';

  constructor(private http: HttpClient) {}

  getTopReleases(): Observable<ReleaseItem[]> {
    return this.http.get<ReleaseItem[]>(`${this.apiUrl}/releases/top-today`).pipe(
      map(releases => releases.map(release => ({
        ...release,
        imageUrl: release.imageUrl || (release as any).cover || 'assets/images/default-cover.png',
        type: release.type || (release.youtubeUrl ? 'song' : 'album')
      })))
    );
  }
}

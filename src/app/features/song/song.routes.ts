import { Routes } from '@angular/router';
import { ArtistSongsComponent } from './pages/artist-songs/artist-songs.component';

export const SONG_ROUTES: Routes = [
  {
    path: 'my-songs',
    component: ArtistSongsComponent
  },
  {
    path: 'detail/:id',
    loadComponent: () =>
      import('./pages/song-detail/song-detail.component').then(
        (m) => m.SongDetailComponent
      )
  }
];
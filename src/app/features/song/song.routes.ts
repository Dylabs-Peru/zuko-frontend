import { Routes } from '@angular/router';
import { ArtistSongsComponent } from './pages/artist-songs/artist-songs.component';

export const SONG_ROUTES: Routes = [
  {
    path: 'my-songs',
    component: ArtistSongsComponent
  }
];
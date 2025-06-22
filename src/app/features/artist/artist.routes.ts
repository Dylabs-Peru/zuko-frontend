import { Routes } from '@angular/router';
import { ProfileArtistComponent } from './page/profile/profile-artist.component';
import { CreateArtistComponent } from './components/create-artist/create-artist.component';

export const ARTIST_ROUTES: Routes = [
  { 
    path: 'create',
    component: CreateArtistComponent
  },
  { 
    path: 'profile-artist',
    component: ProfileArtistComponent 
  },
  { 
    path: ':id',  // Ruta para /artist/45
    component: ProfileArtistComponent 
  },
  { 
    path: '', 
    redirectTo: 'create',
    pathMatch: 'full'
  }
];
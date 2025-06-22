import { Routes } from '@angular/router';
import { ProfileArtistComponent } from './pages/artist-profile/artist-profile.component';
import { CreateArtistComponent } from './components/create-artist/create-artist.component';
import { OtherArtistProfileComponent } from './pages/otherArtistProfile/otherArtistProfile.component';

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
    path: 'profile-artist/:name',
    component: ProfileArtistComponent 
  },
  {
    path: 'other-profile/:id',
    component: OtherArtistProfileComponent
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
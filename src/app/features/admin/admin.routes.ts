import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';

import { AdminGenresComponent } from './pages/admin-genres/admin-genres.component';
import { AdminUsersComponent } from './pages/admin-users/admin-users.component';
import { AdminRolesComponent } from './pages/admin-roles/admin-roles.component';
import { AdminArtistsComponent } from './pages/admin-artists/admin-artists.component';
import { AdminSongsComponent } from './pages/admin-songs/admin-songs.component';
import { AdminAlbumsComponent } from './pages/admin-albums/admin-albums.component';

export const ADMIN_ROUTES: Routes = [
  { 
    path: '', 
    component: AdminDashboardComponent 
  },
  { 
    path: 'users', 
    component: AdminUsersComponent
  },
  { 
    path: 'artists', 
    component: AdminArtistsComponent
  },
  { 
    path: 'genres', 
    component: AdminGenresComponent
  },
  { 
    path: 'albums/artist/:id',
    loadComponent: () => import('./pages/admin-albums-artist-component/admin-albums-artist.component').then(m => m.AdminAlbumsArtistComponent)
  },
  { 
    path: 'albums', 
    component: AdminAlbumsComponent
  },
  { 
    path: 'roles', 
    component: AdminRolesComponent
  },
  {
    path: 'songs',
    component: AdminSongsComponent
  }
];

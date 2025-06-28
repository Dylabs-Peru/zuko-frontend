import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';

import { AdminGenresComponent } from './pages/admin-genres/admin-genres.component';
import { AdminUsersComponent } from './pages/admin-users/admin-users.component';
import { AdminRolesComponent } from './pages/admin-roles/admin-roles.component';
import { AdminArtistsComponent } from './pages/admin-artists/admin-artists.component';

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
    path: 'roles', 
    component: AdminRolesComponent
  }
];

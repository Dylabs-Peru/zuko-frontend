import { GenreComponent } from './features/genre/genre.component';
import { Routes } from '@angular/router';

export const routes: Routes = [
    {
    path: 'auth',
    canActivate: [authGuard],
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
    },
    {
    path: '**',
    redirectTo: ''
    }


];

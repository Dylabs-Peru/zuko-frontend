import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
    path: 'auth',
    canActivate: [authGuard],
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
    },
    {
    path: 'songs',
    canActivate: [authGuard],
    loadChildren: () => import('./features/song/song.routes').then(m => m.SONG_ROUTES)
    },
    {
    path: 'genres',
    loadChildren: () => import('./features/genre/genre.routes').then(m => m.GENRE_ROUTES)
    },
    {
    path: '**',
    redirectTo: ''
    }


];

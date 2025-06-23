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
    path: 'user',
    canActivate: [authGuard],
    loadChildren: () => import('./features/user/user.routes').then(m => m.USER_ROUTES)
    },
    {
    // path: 'admin/genres',
    // canActivate: [authGuard],
    // loadChildren: () => import('./features/genre/genre.routes').then(m => m.GENRE_ROUTES)
    path: 'admin',
    canActivate: [authGuard],
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
    },
    {
    path: 'artist',
    canActivate: [authGuard],
    loadChildren: () => import('./features/artist/artist.routes').then(m => m.ARTIST_ROUTES)
    },
    {
    path: 'album',
    canActivate: [authGuard],
    loadChildren: () => import('./features/album/album.routes').then(m => m.ALBUM_ROUTES)
    },
    {
    path: 'playlist',
    canActivate: [authGuard],
    loadChildren: () => import('./features/playlist/playlist.routes').then(m => m.PLAYLIST_ROUTES)
    },
    {
    path: '**',
    redirectTo: ''
    }


];

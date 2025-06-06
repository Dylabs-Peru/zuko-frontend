import { GenreComponent } from './features/genre/genre.component';
import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: '/genres', pathMatch: 'full'},
    { path: 'genres', component: GenreComponent},
];

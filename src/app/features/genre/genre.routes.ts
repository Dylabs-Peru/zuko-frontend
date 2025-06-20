import { Routes } from "@angular/router";

export const GENRE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/list_genres/list-genres.component').then(m => m.ListGenresComponent)
  }
];
import { TestListGenreComponent } from "./pages/test_genre/test-list-genre.component";
import { Routes } from "@angular/router";
import { GenreComponent } from "./pages/crud_genre/genre.component";

export const GENRE_ROUTES: Routes = [
  {
    path: 'test',
    loadComponent: () => import('./pages/test_genre/test-list-genre.component').then(m => m.TestListGenreComponent)
  },
  {
    path: '',
    loadComponent: () => import('./pages/crud_genre/genre.component').then(m => m.GenreComponent)
  }
];
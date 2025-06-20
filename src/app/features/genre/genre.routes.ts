import { TestListGenreComponent } from "./pages/test_genre/test-list-genre.component";
import { Routes } from "@angular/router";

export const GENRE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/test_genre/test-list-genre.component').then(m => m.TestListGenreComponent)
  }
];
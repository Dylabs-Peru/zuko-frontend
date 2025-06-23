import { PlaylistLibraryComponent } from "./pages/biblioteca/bibiloteca.component";
import { Routes } from "@angular/router";

export const PLAYLIST_ROUTES: Routes = [
  {
    path: 'library',
    loadComponent: () => import('./pages/biblioteca/bibiloteca.component').then(m => m.PlaylistLibraryComponent)
  },]
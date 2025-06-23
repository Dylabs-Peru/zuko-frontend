import { PlaylistLibraryComponent } from "./pages/biblioteca/bibiloteca.component";
import { Routes } from "@angular/router";

export const PLAYLIST_ROUTES: Routes = [
  {
    path: 'library',
    loadComponent: () => import('./pages/biblioteca/bibiloteca.component').then(m => m.PlaylistLibraryComponent)
    
  },

  { path: ':id',
     loadComponent: () => import('./pages/playlist-display/playlist-display.component').then(m => m.PlaylistDisplayComponent) }


]
import { Routes } from '@angular/router';
// Importa los componentes cuando los crees en ./pages
import { AlbumDetailPageComponent } from './pages/album-detail-page/album-detail-page.component';
// import { AlbumListPageComponent } from './pages/album-list-page/album-list-page.component';
// import { AlbumCreatePageComponent } from './pages/album-create-page/album-create-page.component';
// import { AlbumEditPageComponent } from './pages/album-edit-page/album-edit-page.component';

export const ALBUM_ROUTES: Routes = [

  {
    path: ':id',
    component: AlbumDetailPageComponent // Ver detalle del álbum
  },

  // Puedes agregar más rutas según lo necesites
];

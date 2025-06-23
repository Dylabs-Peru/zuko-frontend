import { Component, Input, OnInit } from '@angular/core';
import { NgIf, NgFor, NgStyle } from '@angular/common';
import { AlbumResponse } from '../../../../models/album.model';
import { RouterModule } from '@angular/router';
import { AlbumService } from '../../../../services/Album.service';

@Component({
  selector: 'app-artist-albums-list',
  standalone: true,
  imports: [NgIf, NgFor, NgStyle, RouterModule],
  templateUrl: './artist-albums-list.component.html',
  styleUrls: ['./artist-albums-list.component.css']
})
export class ArtistAlbumsListComponent implements OnInit {

  openMenuAlbumId: number | null = null;

  toggleAlbumMenu(album: any) {
    this.openMenuAlbumId = this.openMenuAlbumId === album.id ? null : album.id;
  }

  editAlbum(album: any) {
    // Aquí puedes abrir el modal de edición
    console.log('Editar álbum:', album);
    this.openMenuAlbumId = null;
  }

  confirmDeleteAlbum(album: any) {
    // Aquí puedes mostrar un modal de confirmación
    console.log('Eliminar álbum:', album);
    this.openMenuAlbumId = null;
  }


  onAlbumDotsClick(album: any) {
    // Aquí puedes abrir un menú contextual en el futuro
    console.log('Dots click:', album);
  }
  @Input() artistId!: number;
  albums: AlbumResponse[] = [];
  isLoading = true;
  error = '';

  constructor(private albumService: AlbumService) {}

  ngOnInit(): void {
    this.fetchAlbums();
  }

  fetchAlbums(): void {
    this.isLoading = true;
    this.error = '';
    // Si tu endpoint requiere el nombre del álbum, puedes pasar '' para traer todos
    this.albumService.getAlbumsByTitleAndUser('').subscribe({
      next: (res) => {
        // Ajusta según la estructura real de la respuesta
        this.albums = res.data || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los álbumes';
        this.isLoading = false;
      }
    });
  }
}

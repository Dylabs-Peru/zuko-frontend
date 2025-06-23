import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { NgIf, NgFor, NgStyle } from '@angular/common';
import { AlbumResponse } from '../../../../models/album.model';
import { RouterModule } from '@angular/router';
import { AlbumService } from '../../../../services/Album.service';
import { Subscription } from 'rxjs';
import { EditAlbumModalComponent } from '../edit-album-modal/edit-album-modal.component';

@Component({
  selector: 'app-artist-albums-list',
  standalone: true,
  imports: [NgIf, NgFor, NgStyle, RouterModule, EditAlbumModalComponent],
  templateUrl: './artist-albums-list.component.html',
  styleUrls: ['./artist-albums-list.component.css']
})

export class ArtistAlbumsListComponent implements OnInit, OnDestroy {

  openMenuAlbumId: number | null = null;
  showEditModal: boolean = false;
  albumToEdit: any = null;

  toggleAlbumMenu(album: any) {
    this.openMenuAlbumId = this.openMenuAlbumId === album.id ? null : album.id;
  }

  editAlbum(album: any) {
    this.albumToEdit = { ...album };
    this.showEditModal = false;
    setTimeout(() => {
      this.showEditModal = true;
    }, 0);
    this.openMenuAlbumId = null;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.albumToEdit = null;
  }

  onAlbumEdited(event: any) {
    this.fetchAlbums();
    this.closeEditModal();
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

  private albumCreatedSubscription: Subscription | null = null;

  constructor(private albumService: AlbumService) {}

  ngOnInit(): void {
    this.fetchAlbums();
    // Escucha el evento global de álbum creado
    this.albumCreatedSubscription = this.listenForAlbumCreated();
  }

  ngOnDestroy(): void {
    if (this.albumCreatedSubscription) {
      this.albumCreatedSubscription.unsubscribe();
    }
  }

  listenForAlbumCreated(): Subscription {
    // Escucha el evento global 'albumCreated' en window
    const handler = () => {
      this.fetchAlbums();
    };
    window.addEventListener('albumCreated', handler);
    // Devuelve un Subscription compatible para limpiar
    return new Subscription(() => {
      window.removeEventListener('albumCreated', handler);
    });
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

  // Llama esto desde el modal al crear
  static dispatchAlbumCreatedEvent() {
    window.dispatchEvent(new Event('albumCreated'));
  }
}

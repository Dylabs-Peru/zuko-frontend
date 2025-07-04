import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { NgIf, NgFor, NgStyle } from '@angular/common';
import { AlbumResponse } from '../../../../models/album.model';
import { RouterModule } from '@angular/router';
import { AlbumService } from '../../../../services/Album.service';
import { Subscription, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { EditAlbumModalComponent } from '../edit-album-modal/edit-album-modal.component';
import { DeleteAlbumModalComponent } from '../delete-album-modal/delete-album-modal.component';

@Component({
  selector: 'app-artist-albums-list',
  standalone: true,
  imports: [NgIf, NgFor, NgStyle, RouterModule, FormsModule, EditAlbumModalComponent, DeleteAlbumModalComponent],
  templateUrl: './artist-albums-list.component.html',
  styleUrls: ['./artist-albums-list.component.css']
})

export class ArtistAlbumsListComponent implements OnInit, OnDestroy {
  // ...
  addAlbumToShortcut(album: any) {
    // Aquí va la lógica real para añadir a acceso directo
    alert(`Álbum "${album.title}" añadido a acceso directo (demo)`);
    this.openMenuAlbumId = null;
  }
  @Input() isOwnProfile: boolean = false;

  openMenuAlbumId: number | null = null;
  showEditModal: boolean = false;
  albumToEdit: any = null;

  showDeleteModal: boolean = false;
  albumToDelete: any = null;

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

  confirmDeleteAlbum(album: any) {
    this.albumToDelete = { ...album };
    this.showDeleteModal = true;
    this.openMenuAlbumId = null;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.albumToDelete = null;
  }

  onAlbumDeleted() {
    this.fetchAlbums();
    this.closeDeleteModal();
  }


  onAlbumDotsClick(album: any) {
    // Aquí puedes abrir un menú contextual en el futuro
    console.log('Dots click:', album);
  }
  @Input() artistId!: number;
  albums: AlbumResponse[] = [];
  isLoading = true;
  error = '';
  albumSearchQuery: string = '';
  searchQueryChanged: Subject<string> = new Subject<string>();

  private albumCreatedSubscription: Subscription | null = null;

  constructor(private albumService: AlbumService) {}

  onSearch(): void {
    this.searchQueryChanged.next(this.albumSearchQuery);
  }

  private onSearchReal(query: string): void {
    const q = query.trim();
    if (!q) {
      this.fetchAlbums();
      return;
    }
    this.isLoading = true;
    this.error = '';
    if (this.artistId) {
      this.albumService.getAlbumsByArtist(this.artistId).subscribe({
        next: (albums) => {
          // Filtro en frontend por nombre (si backend no soporta búsqueda por nombre de artista ajeno)
          this.albums = albums.filter(a => a.title.toLowerCase().includes(q.toLowerCase()));
          this.isLoading = false;
        },
        error: () => {
          this.albums = [];
          this.isLoading = false;
        }
      });
    } else {
      this.albumService.searchMyAlbums(q).subscribe({
        next: (albums) => {
          this.albums = albums;
          this.isLoading = false;
        },
        error: () => {
          this.albums = [];
          this.isLoading = false;
        }
      });
    }
  }

  ngOnInit(): void {
    this.fetchAlbums();
    // Escucha el evento global de álbum creado
    this.albumCreatedSubscription = this.listenForAlbumCreated();
    this.searchQueryChanged
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe((query: string) => {
        this.onSearchReal(query);
      });
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
    if (this.artistId) {
      // Si hay artistId, cargar álbumes del artista visitado
      this.albumService.getAlbumsByArtist(this.artistId).subscribe({
        next: (albums) => {
          this.albums = albums || [];
          this.isLoading = false;
        },
        error: () => {
          this.albums = [];
          this.isLoading = false;
        }
      });
    } else {
      // Si no hay artistId, cargar álbumes propios
      this.albumService.getAlbumsByTitleAndUser('').subscribe({
        next: (res) => {
          this.albums = res.data || [];
          this.isLoading = false;
        },
        error: () => {
          this.albums = [];
          this.isLoading = false;
        }
      });
    }
  }

  // Llama esto desde el modal al crear
  static dispatchAlbumCreatedEvent() {
    window.dispatchEvent(new Event('albumCreated'));
  }
}

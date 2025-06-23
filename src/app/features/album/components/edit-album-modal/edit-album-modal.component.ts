import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListGenresComponent } from '../../../genre/pages/list_genres/list-genres.component';
import { AlbumService } from '../../../../services/Album.service';

@Component({
  selector: 'app-edit-album-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ListGenresComponent],
  templateUrl: './edit-album-modal.component.html',
  styleUrls: ['./edit-album-modal.component.css']
})
export class EditAlbumModalComponent implements OnChanges {
  @Input() show = false;
  @Input() album: any = null; // Recibe el álbum a editar
  @Output() close = new EventEmitter<void>();
  @Output() albumEdited = new EventEmitter<any>();

  tab: 'info' | 'songs' = 'info';

  editTitle: string = '';
  editGenreId: number|null = null;
  isSaving = false;

  constructor(private albumService: AlbumService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['album'] && this.album) {
      this.editTitle = this.album.title || '';
      this.editGenreId = this.album.genreId || null;
    }
  }

  selectTab(tab: 'info' | 'songs') {
    this.tab = tab;
  }

  hasChanges(): boolean {
    return (
      this.album && (
        this.editTitle !== this.album.title ||
        this.editGenreId !== this.album.genreId
      )
    );
  }

  onSave() {
    if (!this.album || !this.editTitle || !this.editGenreId) return;
    this.isSaving = true;
    const albumRequest = {
      title: this.editTitle,
      genreId: this.editGenreId,
      releaseYear: this.album.releaseYear,
      artistId: this.album.artistId,
      songs: this.album.songs || [],
      cover: this.album.cover
    };
    this.albumService.updateAlbum(this.album.id, albumRequest).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.albumEdited.emit(res);
        this.onClose();
      },
      error: () => {
        this.isSaving = false;
        // Aquí podrías agregar feedback visual de error
      }
    });
  }

  onClose() {
    this.close.emit();
  }
}

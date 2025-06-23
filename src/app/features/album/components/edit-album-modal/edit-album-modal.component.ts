import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListGenresComponent } from '../../../genre/pages/list_genres/list-genres.component';
import { AlbumService } from '../../../../services/Album.service';
import { SongService } from '../../../../services/Song.service';
import { SongResponse } from '../../../../models/song.model';

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
  @Output() albumEdited = new EventEmitter<void>();

  tab: 'info' | 'songs' = 'info';

  editTitle: string = '';
  editGenreId: number|null = null;
  isSaving: boolean = false;

  // Portada
  coverUrl: string = '';
  coverFile: File | null = null;

  // Canciones
  songs: SongResponse[] = [];
  selectedSongIds: number[] = [];
  isLoadingSongs: boolean = false;

  constructor(private albumService: AlbumService, private songService: SongService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['album'] && this.album) {
      this.editTitle = this.album.title || '';
      this.editGenreId = this.album.genreId || null;
      // Portada actual
      this.coverUrl = this.album.cover || '';
      this.coverFile = null;
      // Preselecciona canciones del álbum (por id si hay, si no por title)
      this.selectedSongIds = [];
      this.loadSongs();
    }
  }

  loadSongs() {
    this.isLoadingSongs = true;
    this.songService.getMySongs().subscribe({
      next: (songs: SongResponse[]) => {
        this.songs = songs;
        // Preselecciona por id si hay, si no por title
        if (this.album?.songs?.length) {
          this.selectedSongIds = songs
            .filter(song => this.album.songs.some((alSong: any) => (alSong.id && alSong.id === song.id) || (alSong.title && alSong.title === song.title)))
            .map(song => song.id);
        }
        this.isLoadingSongs = false;
      },
      error: () => {
        this.songs = [];
        this.isLoadingSongs = false;
      }
    });
  }

  selectTab(tab: 'info' | 'songs') {
    this.tab = tab;
  }

  toggleSongSelection(songId: number) {
    if (this.selectedSongIds.includes(songId)) {
      this.selectedSongIds = this.selectedSongIds.filter(id => id !== songId);
    } else {
      this.selectedSongIds = [...this.selectedSongIds, songId];
    }
  }

  onClose() {
    this.close.emit();
  }

  onSave() {
    if (!this.editTitle || !this.editGenreId || !this.album || this.selectedSongIds.length < 2) return;
    this.isSaving = true;
    // Mapear las canciones seleccionadas al formato SongRequest si es necesario
    const selectedSongs = this.songs.filter(song => this.selectedSongIds.includes(song.id));
    // Si la portada es base64 y no URL, no la envíes (o envía la original)
    let coverToSend = this.coverUrl;
    if (this.coverUrl && this.coverUrl.startsWith('data:image')) {
      // El backend NO acepta base64, así que no la enviamos (o podrías subirla a otro endpoint y poner la URL)
      coverToSend = this.album.cover || '';
    }
    this.albumService.updateAlbum(this.album.id, {
      title: this.editTitle,
      releaseYear: this.album.releaseYear,
      artistId: this.album.artistId,
      genreId: this.editGenreId,
      cover: coverToSend,
      songs: selectedSongs.map(song => ({
        title: song.title
      }))
    }).subscribe({
      next: () => {
        this.isSaving = false;
        this.albumEdited.emit();
        this.close.emit();
      },
      error: () => {
        this.isSaving = false;
        // Manejo de error opcional
      }
    });
  }

  onCoverSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.coverFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.coverUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeCover() {
    this.coverUrl = '';
    this.coverFile = null;
  }
}

import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SongService } from '../../../../services/Song.service';
import { SongResponse, SongRequest } from '../../../../models/song.model';
import { AddSongToPlaylistModalComponent } from '../../../playlist/components/agregar-cancion-playlist/add-song-to-playlist.component';

@Component({
  selector: 'app-artist-songs',
  standalone: true,
  imports: [CommonModule, FormsModule, AddSongToPlaylistModalComponent],
  templateUrl: './artist-songs.component.html',
  styleUrls: ['./artist-songs.component.css']
})
export class ArtistSongsComponent implements OnInit {
  @Input() artistId!: number;
  @Input() isOwnProfile = false;

  songs: SongResponse[] = [];
  loading = true;

  openMenuIndex: number | null = null;
  showDeleteConfirm = false;
  songToDelete: SongResponse | null = null;

  showSongForm = false;
  editingSong: Partial<SongResponse> = { title: '', isPublicSong: false };
  formError: string | null = null;

  selectedSongForPlaylist: SongResponse | null = null;
  showAddToPlaylistModal = false;

  constructor(private songService: SongService) {}

  ngOnInit(): void {
    this.loadSongs();
  }

  loadSongs(): void {
    this.songService.getMySongs().subscribe({
      next: (songs) => {
        this.songs = songs;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  openCreateForm(): void {
    this.editingSong = { title: '', isPublicSong: false };
    this.showSongForm = true;
    this.formError = null;
    this.openMenuIndex = null;
  }

  closeForm(): void {
    this.showSongForm = false;
    this.formError = null;
  }

  openEditForm(song: SongResponse): void {
    this.editingSong = { ...song };
    this.showSongForm = true;
    this.formError = null;
    this.openMenuIndex = null;
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.formError = null;

    const title = this.editingSong.title?.trim() || '';

    if (!title) {
      this.formError = 'El título es obligatorio.';
      return;
    }

    if (title.length < 3) {
      this.formError = 'El título debe tener más de 3 caracteres.';
      return;
    }

    const songPayload = {
      title,
      isPublicSong: this.editingSong.isPublicSong!
    };

    const request$ = this.editingSong.id
      ? this.songService.updateSong(this.editingSong.id, songPayload)
      : this.songService.createSong(songPayload);

    request$.subscribe({
      next: () => {
        this.loadSongs();
        this.closeForm();
      },
      error: (err) => {
        console.error('Error al guardar la canción', err);
        this.formError = err.error?.message || 'Error al procesar la canción.';
      }
    });
  }

  toggleMenu(index: number): void {
    this.openMenuIndex = this.openMenuIndex === index ? null : index;
  }

  confirmDelete(song: SongResponse): void {
    this.songToDelete = song;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.songToDelete = null;
    this.showDeleteConfirm = false;
  }

  deleteConfirmed(): void {
    if (!this.songToDelete) return;

    this.songService.deleteSong(this.songToDelete.id).subscribe({
      next: () => {
        this.loadSongs();
        this.cancelDelete();
      },
      error: (err) => {
        console.error('Error al eliminar canción', err);
        alert('Error al eliminar la canción.');
      }
    });
  }

  openAddToPlaylist(song: SongResponse) {
  this.selectedSongForPlaylist = song;
  this.showAddToPlaylistModal = true;
  }

  onCloseAddToPlaylist() {
    this.showAddToPlaylistModal = false;
    this.selectedSongForPlaylist = null;
  }

  onSongAddedToPlaylist() {
    this.showAddToPlaylistModal = false;
    this.selectedSongForPlaylist = null;
  }
}
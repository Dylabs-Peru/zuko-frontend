import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SongService } from '../../../../services/Song.service';
import { SongResponse, SongRequest } from '../../../../models/song.model';
@Component({
  selector: 'app-artist-songs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './artist-songs.component.html',
  styleUrls: ['./artist-songs.component.css']
})
export class ArtistSongsComponent implements OnInit {
  songs: SongResponse[] = [];
  isArtist = false;
  loading = true;
  showSongForm = false;
  editingSong: Partial<SongResponse> = { title: '', isPublicSong: false };
  formError: string | null = null;

  openMenuIndex: number | null = null;
  showDeleteConfirm = false;
  songToDelete: SongResponse | null = null;

  constructor(private songService: SongService) {}

  ngOnInit(): void {
    this.loadSongs();
  }

  loadSongs(): void {
    this.songService.getMySongs().subscribe({
      next: (songs) => {
        this.songs = songs;
        this.isArtist = true;
        this.loading = false;
      },
      error: (err) => {
        if (err.error?.message?.includes('perfil de artista')) {
          this.isArtist = false;
        }
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

  openEditForm(song: SongResponse): void {
    this.editingSong = { ...song };
    this.showSongForm = true;
    this.formError = null;
    this.openMenuIndex = null;
  }

  closeForm(): void {
    this.showSongForm = false;
    this.formError = null;
  }

  toggleMenu(index: number): void {
    this.openMenuIndex = this.openMenuIndex === index ? null : index;
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
      title: title,
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
}
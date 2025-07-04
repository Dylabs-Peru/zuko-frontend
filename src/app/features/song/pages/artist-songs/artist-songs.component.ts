import { Component, OnInit, Input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SongService } from '../../../../services/Song.service';
import { SongResponse, SongRequest } from '../../../../models/song.model';
import { MusicPlayerService } from '../../../../services/music-player.service';
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
  @Input() songs: SongResponse[] = [];
  loading = true;

  openMenuIndex: number | null = null;
  showDeleteConfirm = false;
  songToDelete: SongResponse | null = null;
  successMessage: string | null = null;

  // Variables para sincronización con el reproductor global
  currentSongId: number | null = null;

  showSongForm = false;
  editingSong: Partial<SongResponse> = { title: '', isPublicSong: false, youtubeUrl: '' };
  formError: string | null = null;

  selectedSongForPlaylist: SongResponse | null = null;
  showAddToPlaylistModal = false;
  previewImageUrl: string | null = null;

  constructor(private songService: SongService, private musicPlayerService: MusicPlayerService) {
    // Effect para sincronizar el estado local con el servicio global
    effect(() => {
      const globalSong = this.musicPlayerService.currentSong();
      
      // Sincronizar currentSongId con la canción global
      if (globalSong) {
        this.currentSongId = globalSong.id;
      } else {
        this.currentSongId = null;
      }
    });
  }

  // Getters para acceder al estado global
  get isPlaying(): boolean {
    return this.musicPlayerService.isPlaying();
  }

  get playerRef(): any {
    return this.musicPlayerService.playerRef();
  }

  // Método para saber si una canción específica está reproduciéndose Y se reprodujo desde este componente
  isSongPlaying(songId: number): boolean {
    const isPlaying = this.musicPlayerService.isPlaying();
    const globalSong = this.musicPlayerService.currentSong();
    const sourcePlaylistId = this.musicPlayerService.sourcePlaylistId();
    
    // Solo mostrar como reproduciéndose si:
    // 1. Se está reproduciendo
    // 2. Es la canción correcta
    // 3. NO se reprodujo desde una playlist (sourcePlaylistId debe ser null)
    // Si sourcePlaylistId no es null, significa que se reprodujo desde una playlist, no desde este componente
    return isPlaying && 
           globalSong?.id === songId && 
           sourcePlaylistId === null;
  }

  ngOnInit(): void {
    this.loadSongs();
  }

  showSuccess(message: string): void {
  this.successMessage = message;
  setTimeout(() => {
    this.successMessage = null;
  }, 3000); // Oculta después de 3 segundos
}

  loadSongs(): void {
    if (this.artistId) {
      this.songService.getSongsByArtist(this.artistId).subscribe({
        next: (songs) => {
          this.songs = songs;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    } else {
      // fallback por si quieres usarlo en "mis canciones"
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
      isPublicSong: this.editingSong.isPublicSong!, youtubeUrl: this.editingSong.youtubeUrl || '', imageUrl: this.editingSong.imageUrl || ''
    };

    const request$ = this.editingSong.id
      ? this.songService.updateSong(this.editingSong.id, songPayload)
      : this.songService.createSong(songPayload);

    request$.subscribe({
    next: () => {
      this.loadSongs();
      this.closeForm();
      const msg = this.editingSong.id ? 'Canción editada correctamente' : 'Canción creada correctamente';
      this.showSuccess(msg);
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
        this.showSuccess('Canción eliminada correctamente');
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

  extractVideoId(url: string): string {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : '';
  }

  playSong(song: SongResponse): void {
    const videoId = this.extractVideoId(song.youtubeUrl);
    
    const sourcePlaylistId = this.musicPlayerService.sourcePlaylistId();
    const currentSong = this.musicPlayerService.currentSong();
    const isPlaying = this.musicPlayerService.isPlaying();
    
    // Si la misma canción se está reproduciendo desde este componente (sin playlist), permitir toggle
    if (currentSong?.id === song.id && sourcePlaylistId === null) {
      this.musicPlayerService.togglePlay();
    } else {
      // En cualquier otro caso: nueva canción O canción reproduciéndose desde playlist - reproducir desde este componente
      this.musicPlayerService.loadSong(videoId, song); // Sin playlistId para indicar que es individual
    }
  }

coverFile: File | null = null;
uploading = false;

onImageSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (!input.files?.[0]) return;

  const file = input.files[0];
  this.coverFile = file;

  // Vista previa inmediata
  const reader = new FileReader();
  reader.onload = (e: any) => {
    this.previewImageUrl = e.target.result;
  };
  reader.readAsDataURL(file);

  // Subir a Cloudinary
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'zuko_pfps');

  this.uploading = true;
  fetch('https://api.cloudinary.com/v1_1/dqk8inmwe/image/upload', {
    method: 'POST',
    body: formData
  })
    .then((res) => res.json())
    .then((data) => {
      this.uploading = false;
      if (data.secure_url) {
        this.editingSong.imageUrl = data.secure_url; // ← Guarda la URL para enviar
      } else {
        alert('Error al subir la imagen');
      }
    })
    .catch(() => {
      this.uploading = false;
      alert('Error al subir la imagen');
    });
}

defaultCoverUrl = 'https://res.cloudinary.com/dgrrhrvbq/image/upload/v1751432187/Group_25_rnsf9v.png';
getSafeImageUrl(imageUrl?: string | null): string {
  return imageUrl || this.defaultCoverUrl;
}
}
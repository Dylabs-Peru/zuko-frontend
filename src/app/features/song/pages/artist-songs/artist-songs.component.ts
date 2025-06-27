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
  @Input() songs: SongResponse[] = [];
  loading = true;

  openMenuIndex: number | null = null;
  showDeleteConfirm = false;
  songToDelete: SongResponse | null = null;

  playerRefs: { [key: number]: any } = {};
  isPlaying: { [key: number]: boolean } = {};
  showSongForm = false;
  editingSong: Partial<SongResponse> = { title: '', isPublicSong: false, youtubeUrl: '' };
  formError: string | null = null;

  selectedSongForPlaylist: SongResponse | null = null;
  showAddToPlaylistModal = false;
  previewImageUrl: string | null = null;

  constructor(private songService: SongService) {}

  ngOnInit(): void {
    this.loadSongs();
  }

  loadSongs(): void {
    this.playerRefs = {}; // Reinicia los reproductores
  this.isPlaying = {};
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

  extractVideoId(url: string): string {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : '';
  }

  initYouTubePlayer(index: number, videoId: string): void {
  if (this.playerRefs[index]) return; // Ya existe

  const player = new (window as any).YT.Player(`yt-player-${index}`, {
    height: '0', // oculto
    width: '0',
    videoId: videoId,
    events: {
      onReady: () => {
        this.playerRefs[index] = player;
      }
    }
  });
}

togglePlay(index: number, youtubeUrl: string): void {
  const videoId = this.extractVideoId(youtubeUrl);
  if (!videoId) return;

  const player = this.playerRefs[index];

  if (!player) {
    this.initYouTubePlayer(index, videoId);
    setTimeout(() => this.play(index), 500);
    return;
  }

  if (this.isPlaying[index]) {
    player.pauseVideo();
    this.isPlaying[index] = false;
  } else {
    player.seekTo(0);
    this.play(index);
  }
}

play(index: number): void {
  const player = this.playerRefs[index];
  player.playVideo();
  this.isPlaying[index] = true;
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
}
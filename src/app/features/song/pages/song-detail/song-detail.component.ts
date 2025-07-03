import { Component, OnInit, effect } from '@angular/core';
import { SongResponse } from '../../../../models/song.model';
import { SongService } from '../../../../services/Song.service';
import { MusicPlayerService } from '../../../../services/music-player.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AddSongToPlaylistModalComponent } from '../../../playlist/components/agregar-cancion-playlist/add-song-to-playlist.component';

@Component({
  selector: 'app-song-detail',
  standalone: true,
  imports: [CommonModule, AddSongToPlaylistModalComponent],
  templateUrl: './song-detail.component.html',
  styleUrls: ['./song-detail.component.css']
})
export class SongDetailComponent implements OnInit {
  songId!: number;
  song!: SongResponse;
  loading = true;
  error = '';

  selectedSongForPlaylist: SongResponse | null = null;
  showAddToPlaylistModal = false;

  // Variables para sincronización con el reproductor global
  currentSongId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private songService: SongService,
    private musicPlayerService: MusicPlayerService
  ) {
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

  // Método para saber si esta canción específica está reproduciéndose Y se reprodujo desde este componente
  get isSongPlaying(): boolean {
    const isPlaying = this.musicPlayerService.isPlaying();
    const globalSong = this.musicPlayerService.currentSong();
    const sourcePlaylistId = this.musicPlayerService.sourcePlaylistId();
    
    // Solo mostrar como reproduciéndose si:
    // 1. Se está reproduciendo
    // 2. Es la canción correcta
    // 3. NO se reprodujo desde una playlist (sourcePlaylistId debe ser null)
    return isPlaying && 
           globalSong?.id === this.song?.id && 
           sourcePlaylistId === null;
  }

  ngOnInit(): void {
    this.subscribeToRouteChanges();
  }

subscribeToRouteChanges(): void {
  this.route.paramMap.subscribe(params => {
    this.songId = Number(params.get('id'));
    this.loadSong();
  });
}

  loadSong(): void {
    this.songId = Number(this.route.snapshot.paramMap.get('id'));

    if (this.songId) {
      this.songService.getSongById(this.songId).subscribe({
        next: (data) => {
          this.song = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'No se pudo cargar la canción';
          this.loading = false;
        }
      });
    }
  }

  extractVideoId(url: string): string {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : '';
  }

  togglePlay(): void {
    if (!this.song) return;
    
    const videoId = this.extractVideoId(this.song.youtubeUrl);
    
    const sourcePlaylistId = this.musicPlayerService.sourcePlaylistId();
    const currentSong = this.musicPlayerService.currentSong();
    
    // Si la misma canción se está reproduciendo desde este componente (sin playlist), permitir toggle
    if (currentSong?.id === this.song.id && sourcePlaylistId === null) {
      this.musicPlayerService.togglePlay();
    } else {
      // En cualquier otro caso: nueva canción O canción reproduciéndose desde playlist - reproducir desde este componente
      this.musicPlayerService.loadSong(videoId, this.song); // Sin playlistId para indicar que es individual
    }
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

  get safeImageUrl(): string {
    return this.song?.imageUrl || 'https://res.cloudinary.com/dgrrhrvbq/image/upload/v1751432187/Group_25_rnsf9v.png';
  }
}
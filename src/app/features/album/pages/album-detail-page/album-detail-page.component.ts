import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AlbumService } from '../../../../services/Album.service';

@Component({
  selector: 'app-album-detail-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './album-detail-page.component.html',
  styleUrls: ['./album-detail-page.component.css']
})
export class AlbumDetailPageComponent implements OnInit {
  showMenu = false;
  album: any = null;
  loading = true;
  error = '';

  // Añadidos para animaciones y control de reproducción
  currentSongId: number | null = null;
  isPlaying: boolean = false;
  hoveredSong: number | null = null;
  playerRef: any = null;

  constructor(private route: ActivatedRoute, private albumService: AlbumService, private router: Router) {}

  ngOnInit() {
    const albumId = this.route.snapshot.paramMap.get('id');
    if (!albumId) {
      this.error = 'ID de álbum no especificado';
      this.loading = false;
      return;
    }
    this.loading = true;
    this.error = '';
    this.albumService.getAlbumById(Number(albumId)).subscribe({
      next: (res) => {
        this.album = res.data || res; // Ajusta según estructura real
        this.loading = false;
      },
      error: (err) => {
        this.error = 'No se pudo cargar el álbum';
        this.loading = false;
      }
    });
  }

  togglePlay(): void {
    if (!this.playerRef) return;
    if (this.isPlaying) {
      this.playerRef.pauseVideo();
      this.isPlaying = false;
    } else {
      this.playerRef.playVideo();
      this.isPlaying = true;
    }
  }

  playSong(song: any) {
    const videoId = this.extractVideoId(song.youtubeUrl);
    if (!videoId) {
      this.isPlaying = false;
      this.currentSongId = null;
      return;
    }

    // Si das pausa a la misma canción
    if (this.currentSongId === song.id && this.isPlaying) {
      this.playerRef?.pauseVideo();
      this.isPlaying = false;
      return;
    }

    // Si das play a la misma canción pausada
    if (this.currentSongId === song.id && !this.isPlaying) {
      this.playerRef?.playVideo();
      this.isPlaying = true;
      return;
    }

    // Si cambias de canción, destruye el reproductor anterior
    if (this.playerRef && typeof this.playerRef.destroy === 'function') {
      this.playerRef.destroy();
      this.playerRef = null;
    }

    this.currentSongId = song.id;
    this.initYouTubePlayer(videoId);
  }

  extractVideoId(url: string): string {
    if (!url) return '';
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : '';
  }

  initYouTubePlayer(videoId: string): void {
    setTimeout(() => {
      this.playerRef = new (window as any).YT.Player('yt-player-album', {
        videoId,
        height: '0',
        width: '0',
        events: {
          onReady: () => {
            this.playerRef.playVideo();
            this.isPlaying = true;
          },
          onStateChange: (event: any) => {
            // Cuando termina la canción, resetea el estado
            if (event.data === (window as any).YT.PlayerState.ENDED) {
              this.isPlaying = false;
              this.currentSongId = null;
            }
          }
        }
      });
    }, 100);
  }

  public goToArtistProfile() {
    this.router.navigate(['/artist/profile-artist']);
  }
}


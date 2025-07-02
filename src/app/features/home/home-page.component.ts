import { ShortcutsService } from './../../services/shortcuts.service';
import { Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ShortcutsResponse } from '../../models/shortcuts.model';
import { PlaylistSummaryResponse } from './../../models/playlist.model';
import { AlbumResponse } from '../../models/album.model';
import { SongService } from '../../services/Song.service';
import { SongResponse } from '../../models/song.model';

@Component({
  standalone: true,
  selector: 'app-home-page',
  imports: [CommonModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent implements OnInit{
  shortcuts: ShortcutsResponse[] = [];
  playlists: PlaylistSummaryResponse[] = [];
  albums : AlbumResponse[] = []; // actualizar  
  userId: number | null = null;
  shortcutsId: number | null = null;
  error = '';
  latestSongsToday: SongResponse[] = [];
  currentSongIndex = 0;
  playerRef: any = null;
  isPlaying = false;
  private bannerInterval: any;
  isLoading = false;
  isPlayerReady = false;
  slideDirection: 'left' | 'right' = 'right';

  constructor(private router: Router,
              private shortcutsService: ShortcutsService,
              private songService: SongService
  ){}

  ngOnInit(): void {
    this.loadShortcuts();
    this.loadLatestSongsToday();

    setInterval(() => {
    if (this.latestSongsToday.length > 0) {
      this.slideDirection = 'right';
      this.nextBanner();
    }
  }, 15000);
  }


  loadLatestSongsToday(): void {
    this.songService.getTop3PublicSongs().subscribe({
      next: (songs) => {
        this.latestSongsToday = songs;
        if (songs.length > 0) {
          const videoId = this.extractVideoId(songs[0].youtubeUrl);
          this.initYouTubePlayer(videoId);
        }
      },
      error: (err) => {
        console.error('Error al cargar canciones del día', err);
      }
    });
  }

  extractVideoId(url: string): string {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : '';
  }

  initYouTubePlayer(videoId: string): void {
  this.isPlayerReady = false;
  this.isPlaying = false;

  if (this.playerRef && this.playerRef.destroy) {
    this.playerRef.destroy();
  }

  setTimeout(() => {
      this.playerRef = new (window as any).YT.Player('yt-player-detail', {
        videoId,
        height: '0',
        width: '0',
        events: {
          onReady: () => {
            this.isPlayerReady = true;
            console.log('Player ready');
          },
          onError: (error: any) => {
            console.error('Error en reproductor de YouTube:', error);
          }
        }
      });
    }, 100);
}

  togglePlay(): void {
  if (!this.playerRef || !this.isPlayerReady) {
    console.warn('El reproductor aún no está listo');
    return;
  }

  if (this.isPlaying) {
    this.playerRef.pauseVideo();
    this.isPlaying = false;
  } else {
    this.playerRef.seekTo(0);
    this.playerRef.playVideo();
    this.isPlaying = true;
  }
}

  nextBanner(): void {
  if (this.latestSongsToday.length === 0) return;
  this.slideDirection = 'right';
  this.currentSongIndex = (this.currentSongIndex + 1) % this.latestSongsToday.length;
  const videoId = this.extractVideoId(this.latestSongsToday[this.currentSongIndex].youtubeUrl);
  this.initYouTubePlayer(videoId);
}

 prevBanner(): void {
  if (this.latestSongsToday.length === 0) return;
  this.slideDirection = 'left';
  this.currentSongIndex =
    (this.currentSongIndex - 1 + this.latestSongsToday.length) % this.latestSongsToday.length;
  const videoId = this.extractVideoId(this.latestSongsToday[this.currentSongIndex].youtubeUrl);
  this.initYouTubePlayer(videoId);
}

goToSong(songId: number): void {
  this.router.navigate(['/songs/detail', songId]);
}

  loadShortcuts(): void {
    this.isLoading = true;
    this.error = '';
    this.shortcutsService.getShortcutsByUser().subscribe({
      next: (shortcuts) => {
        this.shortcutsId = shortcuts.ShortcutsId;
        this.playlists = shortcuts.Playlists;
        this.albums = shortcuts.Albums;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los accesos directos';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  goToPlaylist(playlistId: number) {
     this.router.navigate(['/playlist', playlistId]);
  }

  defaultCoverUrl = 'https://res.cloudinary.com/dgrrhrvbq/image/upload/v1751432187/Group_25_rnsf9v.png';

  getSafeImageUrl(imageUrl?: string | null): string {
    return imageUrl || this.defaultCoverUrl;
  }

}

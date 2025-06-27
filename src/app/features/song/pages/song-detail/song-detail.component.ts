import { Component, OnInit } from '@angular/core';
import { SongResponse } from '../../../../models/song.model';
import { SongService } from '../../../../services/Song.service';
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
  apiReady = false;

  selectedSongForPlaylist: SongResponse | null = null;
  showAddToPlaylistModal = false;

  isPlaying = false;
  playerRef: any;

  constructor(
    private route: ActivatedRoute,
    private songService: SongService
  ) {}

  ngOnInit(): void {
  if (!(window as any).YT) {
    (window as any).onYouTubeIframeAPIReady = () => {
      this.apiReady = true;
      this.subscribeToRouteChanges(); // escuchar cambios
    };
  } else {
    this.apiReady = true;
    this.subscribeToRouteChanges(); // escuchar cambios
  }
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

          const videoId = this.extractVideoId(this.song.youtubeUrl);
          if (videoId && this.apiReady) {
            this.initYouTubePlayer(videoId);
          }
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

  initYouTubePlayer(videoId: string): void {
    setTimeout(() => {
      this.playerRef = new (window as any).YT.Player('yt-player-detail', {
        videoId,
        height: '0',
        width: '0',
        events: {
          onReady: () => {
            console.log('Player ready');
          }
        }
      });
    }, 100);
  }

  togglePlay(): void {
    if (!this.playerRef) return;

    if (this.isPlaying) {
      this.playerRef.pauseVideo();
      this.isPlaying = false;
    } else {
      this.playerRef.seekTo(0);
      this.playerRef.playVideo();
      this.isPlaying = true;
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
    return this.song?.imageUrl || 'https://res.cloudinary.com/dqk8inmwe/image/upload/v1750800568/pfp_placeholder_hwwumb.jpg';
  }
}
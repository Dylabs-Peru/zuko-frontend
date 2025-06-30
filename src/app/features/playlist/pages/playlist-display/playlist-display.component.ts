import { PlaylistSummaryResponse } from './../../../../models/playlist.model';
import { ConfirmDeleteDialogComponent } from './../../components/borrar-playlist/confirm-delete-dialog.component';
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Router } from "@angular/router";
import { DatePipe } from "@angular/common";
import { PlaylistService } from "../../../../services/playlist.service";
import { NgFor, NgIf, NgStyle } from "@angular/common";
import { PlaylistResponse } from "../../../../models/playlist.model";
import { PlaylistOptionsPopupComponent } from "../../components/playlist-options-popup/playlist-options-popup.component";
import { PlaylistSongsEditListComponent } from '../../components/editar-playlist/playlist-songs-edit-list.component';
import { AlbumService } from '../../../../services/Album.service';
import { AlbumResponse } from '../../../../models/album.model';
import { AddSongToPlaylistModalComponent } from '../../components/agregar-cancion-playlist/add-song-to-playlist.component';
import { SongResponse } from '../../../../models/song.model';
import { ShortcutsService } from '../../../../services/shortcuts.service';

@Component({
  selector: 'app-playlist-display',
  standalone: true,
  templateUrl: './playlist-display.component.html',
  styleUrls: ['./playlist-display.component.css'],
  imports: [NgIf, NgStyle, NgFor, DatePipe, PlaylistOptionsPopupComponent, ConfirmDeleteDialogComponent, PlaylistSongsEditListComponent, AddSongToPlaylistModalComponent  ]
})

export class PlaylistDisplayComponent implements OnInit {
  playlist: PlaylistResponse | null = null;
  error = '';
  loading = true
  showMenu = false;
  showDeleteDialog = false;
  showEditDialog = false;
  albumMap: { [songId: number]: AlbumResponse|null } = {};
  userID: number | null = null;
  songs: SongResponse[] = [];
  selectedSongForPlaylist: SongResponse | null = null;
  showAddToPlaylistModal = false;
  shortcutsPlaylists: PlaylistSummaryResponse[] = [];
  currentSong: SongResponse | null = null;
  isPlaying = false;
  playerRef: any;
  currentSongId: number | null = null;
  currentSongIndex: number | null = null;

  constructor(
            private playlistService: PlaylistService, 
            private route: ActivatedRoute,
            private router: Router,
            private albumService: AlbumService,
            private shortcutService: ShortcutsService
  ) {}
   
   ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
    const playlistId = params.get('id');
    if (!playlistId) {
      this.error = 'ID de playlist no especificado';
      this.loading = false;
      return;
    }
    this.loadPlaylist(Number(playlistId));
    });

    const auth = localStorage.getItem('auth');
    if (auth) {
      const authObj = JSON.parse(auth);
      this.userID = authObj.user?.id || null;
    }
      this.shortcutService.playlists$.subscribe(playlists => {
      this.shortcutsPlaylists = playlists;
    });
      this.shortcutService.getShortcutsByUser().subscribe();
    }

    onEditPlaylist() {
        this.showMenu = false;
        this.showEditDialog = true;

    }

    onDeletePlaylist() {
        this.showDeleteDialog = true;
    }

    onConfirmDelete() {
    this.playlistService.deletePlaylist(this.playlist!.playlistId).subscribe({
      next: () => {
        this.shortcutService.removePlaylistFromShortcuts(this.playlist!.playlistId);
        this.showDeleteDialog = false;
        this.router.navigate(['/playlist/library']);
      },
      error: (err) => {
        alert('No se pudo borrar la playlist.');
        this.showDeleteDialog = false;
      }
    });
    }

    onCancelDelete() {
      this.showDeleteDialog = false;
      this.showMenu = false;
    }

    onSongRemoved(songId: number) {
      if (this.playlist) {
        this.playlist.songs = this.playlist.songs.filter(song => song.id !== songId);
      }
    }

    onCloseEditDialog() {
      this.showEditDialog = false;
    }

    onPlaylistEdited(editedPlaylist: PlaylistResponse) {
      this.playlist = editedPlaylist;
      this.showEditDialog = false;
    }

    canEdit(): boolean {
      return this.playlist?.userID === this.userID;
  }

    loadPlaylist(playlistId: number) {
    this.loading = true;
    this.error = '';
    this.albumMap = {}; 
    this.playlistService.getPlaylistById(playlistId).subscribe({
      next: (playlist) => {

        if (playlist && Array.isArray(playlist.songs)) {
          playlist.songs = playlist.songs.filter(song => song && song.title);
          playlist.songs.forEach(song => {
            this.albumService.getAlbumBySongId(song.id).subscribe({
              next: (album) => {
                this.albumMap[song.id] = album;
              },
              error: (err) => {
                this.albumMap[song.id] = null;
              }
            });
          });
        }
        this.playlist = playlist; 
        this.loading = false;
      },
      error: (err) => {
        this.error = 'No se pudo cargar la playlist';
        this.loading = false;
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

    onAddToShortcut() {
      if (!this.playlist) return;
      const request = {playlistId: this.playlist.playlistId}
      this.shortcutService.addPlaylistToShortcuts(request).subscribe({
        next: (response) => {
          console.log('Playlist agregada a accesos directos:', response);
          this.shortcutService.getShortcutsByUser().subscribe();
          this.showMenu = false;
          alert('Playlist agregada a accesos directos');
        },
        error: (err) => {
          console.error('Error al agregar playlist a accesos directos:', err);
          alert(this.error = err.error?.detail || 'No se pudo agregar la playlist a accesos directos');
        }
      });
    }

    onRemoveFromShortcut() {
    if (!this.playlist) return;
    this.shortcutService.removePlaylistFromShortcuts(this.playlist.playlistId).subscribe({
      next: () => {
        this.shortcutService.getShortcutsByUser().subscribe();
        this.showMenu = false;
        alert('Playlist eliminada de accesos directos');
      },
      error: (err) => {
        alert('No se pudo eliminar la playlist de accesos directos');
      }
    });
  }

  isInShortcuts(): boolean {  
    return this.shortcutsPlaylists?.some(p => p.playlistId === this.playlist?.playlistId);
  }

   goToHome(): void  {
    this.router.navigate(['/home']);
  }

  playSong(song: SongResponse) {
    const videoId = this.extractVideoId(song.youtubeUrl);
    console.log('🎬 Video ID extraído:', videoId);
    console.log('🔗 URL original:', song.youtubeUrl);
    console.log('🎯 YouTube API disponible:', !!(window as any).YT);
    const songIndex = this.playlist!.songs.findIndex(s => s.id === song.id);
    if (this.currentSongIndex === songIndex && this.isPlaying) {
      this.playerRef.pauseVideo();
      this.isPlaying = false;
    } else if (this.currentSongIndex === songIndex && !this.isPlaying) {
      this.playerRef.playVideo();
      this.isPlaying = true;
    } else {
      this.currentSongIndex = songIndex;
      this.currentSongId = song.id;
      this.initYouTubePlayer(videoId);
  }
  }

  extractVideoId(url: string): string {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : '';
  }

  initYouTubePlayer(videoId: string): void {
    console.log('🚀 Inicializando player con video ID:', videoId);
    if (this.playerRef && this.playerRef.loadVideoById) {
    console.log('🔄 Reutilizando player existente');
    this.playerRef.loadVideoById(videoId);
    return;
  }
    setTimeout(() => {
      if (!(window as any).YT) {
      console.error('❌ YouTube API no está disponible');
      return;
    }
      try {
      this.playerRef = new (window as any).YT.Player('yt-player-playlist', {
        videoId,
        height: '0',
        width: '0',
        events: {
          onReady: () => {
            console.log('✅ Player listo, intentando reproducir...');
            this.playerRef.playVideo();
            this.isPlaying = true;
          },
          onError: (error: any) => {
            console.error('❌ Error en el player:', error);
          },
         onStateChange: (event: any) => {
            console.log('🎵 Estado del player cambió:', event.data);
            if (event.data === (window as any).YT.PlayerState.ENDED) {
              if (this.currentSongIndex !== null && this.currentSongIndex < this.playlist!.songs.length - 1) {
                const nextSong = this.playlist!.songs[this.currentSongIndex + 1];
                this.playSong(nextSong);
              } else {
                // Última canción
                this.isPlaying = false;
                this.currentSongId = null;
                this.currentSongIndex = null;
              }
            }
          } 
        }
      });
    } catch (error) {
      console.error('❌ Error creando el player:', error);
    }
    }, 100);
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
}






  

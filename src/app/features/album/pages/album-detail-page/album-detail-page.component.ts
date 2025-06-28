import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaylistOptionsPopupComponent } from '../../../playlist/components/playlist-options-popup/playlist-options-popup.component';
import { EditAlbumModalComponent } from '../../components/edit-album-modal/edit-album-modal.component';
import { DeleteAlbumModalComponent } from '../../components/delete-album-modal/delete-album-modal.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AlbumService } from '../../../../services/Album.service';

@Component({
  selector: 'app-album-detail-page',
  standalone: true,
  imports: [CommonModule, PlaylistOptionsPopupComponent, EditAlbumModalComponent, DeleteAlbumModalComponent],
  templateUrl: './album-detail-page.component.html',
  styleUrls: ['./album-detail-page.component.css']
})
export class AlbumDetailPageComponent implements OnInit {
  showEditModal = false;
  showDeleteModal = false;

  onEditAlbum() {
    this.showEditModal = true;
    this.showMenu = false;
  }
  onDeleteAlbum() {
    this.showDeleteModal = true;
    this.showMenu = false;
  }
  closeEditModal() {
    this.showEditModal = false;
  }
  closeDeleteModal() {
    this.showDeleteModal = false;
  }
  onAlbumEdited() {
    this.fetchAlbum();
    this.closeEditModal();
  }
  onAlbumDeleted() {
    this.router.navigate(['/artist/profile-artist']);
  }
  onAddAlbumToShortcut() {
    alert('Añadir a acceso directo (demo)');
    this.showMenu = false;
  }
  onRemoveAlbumFromShortcut() {
    alert('Eliminar de acceso directo (demo)');
    this.showMenu = false;
  }
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
    this.fetchAlbum();
  }

  fetchAlbum() {
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

  shufflePlay(): void {
    if (!this.album || !this.album.songs || this.album.songs.length === 0) return;
    const availableSongs = this.album.songs;
    // Si sólo hay una canción, simplemente la reproduce
    if (availableSongs.length === 1) {
      this.playSong(availableSongs[0]);
      return;
    }
    // Elige una canción aleatoria distinta a la actual si es posible
    let randomIndex: number;
    do {
      randomIndex = Math.floor(Math.random() * availableSongs.length);
    } while (availableSongs.length > 1 && availableSongs[randomIndex].id === this.currentSongId);
    this.playSong(availableSongs[randomIndex]);
  }

  togglePlay(): void {
    if (!this.album || !this.album.songs || this.album.songs.length === 0) return;
    const firstSong = this.album.songs[0];
    if (this.currentSongId === firstSong.id && this.playerRef) {
      // Si ya está sonando o pausada la primera, reinicia desde el principio
      this.playerRef.seekTo(0);
      this.playerRef.playVideo();
      this.isPlaying = true;
    } else {
      // Si no está sonando la primera, la inicia
      this.playSong(firstSong);
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
            // Cuando termina la canción, reproduce la siguiente si existe
            if (event.data === (window as any).YT.PlayerState.ENDED) {
              if (this.album && this.album.songs && this.currentSongId != null) {
                const idx = this.album.songs.findIndex((s: any) => s.id === this.currentSongId);
                if (idx !== -1 && idx < this.album.songs.length - 1) {
                  // Hay siguiente canción
                  const nextSong = this.album.songs[idx + 1];
                  this.playSong(nextSong);
                } else {
                  // No hay siguiente, detén todo
                  this.isPlaying = false;
                  this.currentSongId = null;
                }
              } else {
                this.isPlaying = false;
                this.currentSongId = null;
              }
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


import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaylistOptionsPopupComponent } from '../../../playlist/components/playlist-options-popup/playlist-options-popup.component';
import { EditAlbumModalComponent } from '../../components/edit-album-modal/edit-album-modal.component';
import { DeleteAlbumModalComponent } from '../../components/delete-album-modal/delete-album-modal.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AlbumService } from '../../../../services/Album.service';
import { MusicPlayerService } from '../../../../services/music-player.service';

// Interfaz para el tipo de canción en el álbum
interface Song {
  id: number;
  title?: string;
  name?: string; // Algunas canciones podrían usar 'name' en lugar de 'title'
  artistId?: number;
  artistName?: string;
  youtubeUrl: string;
  imageUrl?: string;
  releaseDate?: string;
  isPublicSong?: boolean;
}

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

  // Control de reproducción usando MusicPlayerService
  hoveredSong: number | null = null;
  currentSongId: number | null = null;
  isPlaying: boolean = false;
  
  // Computed para saber si la canción actual pertenece a este álbum
  get isCurrentSongFromThisAlbum(): boolean {
    const currentSong = this.musicPlayerService.currentSong();
    if (!currentSong || !this.album?.songs) return false;
    return this.album.songs.some((song: Song) => song.id === currentSong.id);
  }
  
  // Computed para saber si hay una canción reproduciéndose de este álbum
  get shouldShowPauseInPlayButton(): boolean {
    return this.isPlaying && this.isCurrentSongFromThisAlbum;
  }

  constructor(
    private route: ActivatedRoute, 
    private albumService: AlbumService, 
    private router: Router,
    private musicPlayerService: MusicPlayerService
  ) {
    // Sincronizar el estado local con el servicio global
    effect(() => {
      const globalSong = this.musicPlayerService.currentSong();
      this.currentSongId = globalSong?.id || null;
      this.isPlaying = this.musicPlayerService.isPlaying();
    });
  }

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

        const rawAlbum = res.data || res;

        // Corrige el campo genreId para el modal de edición
        this.album = {
          ...rawAlbum,
          genreId: rawAlbum.genreId ?? (rawAlbum.genre ? rawAlbum.genre.id : null)
        };
        console.log('DEBUG fetchAlbum this.album:', this.album);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'No se pudo cargar el álbum';
        this.loading = false;
      }
    });
  }

  shufflePlay(): void {
    if (!this.album?.songs?.length) return;
    
    const availableSongs = this.album.songs;
    
    // Si solo hay una canción, reproducirla
    if (availableSongs.length === 1) {
      this.playSong(availableSongs[0]);
      return;
    }
    
    // Si ya hay una canción de este álbum reproduciéndose, pausar/reanudar
    if (this.isCurrentSongFromThisAlbum) {
      this.musicPlayerService.togglePlay();
      return;
    }
    
    // Si no hay canción reproduciéndose o es de otro álbum, empezar una aleatoria
    let randomIndex: number;
    do {
      randomIndex = Math.floor(Math.random() * availableSongs.length);
    } while (availableSongs.length > 1 && availableSongs[randomIndex].id === this.currentSongId);
    
    this.playSong(availableSongs[randomIndex] as Song);
  }

  togglePlay(): void {
    if (!this.album?.songs?.length) return;
    
    // Si ya hay una canción de este álbum reproduciéndose, pausar/reanudar
    if (this.isCurrentSongFromThisAlbum) {
      this.musicPlayerService.togglePlay();
      return;
    }
    
    // Si no hay canción reproduciéndose o es de otro álbum, empezar desde la primera
    const firstSong = this.album.songs[0] as Song;
    
    // Si la canción no tiene URL de YouTube, no podemos reproducirla
    if (!firstSong.youtubeUrl) {
      console.error('La canción no tiene una URL de YouTube válida');
      return;
    }
    
    this.playSong(firstSong);
  }

  playSong(song: Song) {
    if (!song || !song.youtubeUrl) {
      console.error('Canción o URL de YouTube no válida');
      return;
    }

    const songIndex = this.album?.songs?.findIndex((s: Song) => s.id === song.id) ?? -1;
    
    // Si es la misma canción, solo pausar/reanudar
    if (this.currentSongId === song.id) {
      this.musicPlayerService.togglePlay();
      return;
    }
    
    // Nueva canción
    this.currentSongId = song.id;
    
    // Crear objeto de canción compatible con SongResponse
    const songToPlay: any = {
      id: song.id,
      title: song.title || song.name,
      artistId: song.artistId || this.album?.artistId,
      artistName: song.artistName || this.album?.artistName,
      youtubeUrl: song.youtubeUrl,
      // Usar la imagen de la canción si está disponible, si no, usar la del álbum
      imageUrl: song.imageUrl || this.album?.cover || 'https://res.cloudinary.com/dgrrhrvbq/image/upload/v1751432187/Group_25_rnsf9v.png',
      releaseDate: song.releaseDate,
      isPublicSong: song.isPublicSong !== undefined ? song.isPublicSong : true
    };

    console.log('🎵 Reproduciendo canción desde álbum:', songToPlay);
    const videoId = this.extractVideoId(songToPlay.youtubeUrl);
    
    if (!videoId) {
      console.error('❌ No se pudo extraer el ID del video de YouTube');
      return;
    }

    console.log('🎬 ID del video de YouTube:', videoId);
    console.log('🖼️ URL de la portada:', songToPlay.imageUrl);

    // Usar el servicio de música global
    this.musicPlayerService.loadSong(videoId, songToPlay, this.album?.id?.toString());
    
    // Asegurarse de que la canción actual se establezca correctamente
    this.musicPlayerService.setCurrentSong(songToPlay);
    this.musicPlayerService.setPlayingState(true);
    
    // Forzar la reproducción después de un breve retraso si es necesario
    setTimeout(() => {
      const player = (this.musicPlayerService as any).playerRef();
      if (player && player.loadVideoById) {
        console.log('▶️ Cargando video directamente con loadVideoById');
        player.loadVideoById(videoId);
        player.playVideo();
      }
    }, 100);
  }

  // Extraer el ID de un video de YouTube (útil para mostrar miniaturas)
  extractVideoId(url: string): string {
    if (!url) return '';
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : '';
  }

  public goToArtistProfile() {
    this.router.navigate(['/artist/profile-artist']);
  }
}


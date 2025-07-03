import { ShortcutsService } from './../../services/shortcuts.service';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ShortcutsResponse, AlbumSummaryResponse } from '../../models/shortcuts.model';
import { PlaylistSummaryResponse } from './../../models/playlist.model';
import { AlbumResponse } from '../../models/album.model';
import { SongService } from '../../services/Song.service';
import { ReleaseService } from '../../services/release.service';
import { ReleaseItem } from '../../models/release.model';
import { MusicPlayerService } from '../../services/music-player.service';
import { SongResponse } from '../../models/song.model';

@Component({
  standalone: true,
  selector: 'app-home-page',
  imports: [CommonModule, RouterModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent implements OnInit, OnDestroy {
  shortcuts: ShortcutsResponse[] = [];
  playlists: PlaylistSummaryResponse[] = [];
  albums: AlbumSummaryResponse[] = [];
  userId: number | null = null;
  shortcutsId: number | null = null;
  error = '';
  activeTab: 'playlists' | 'albums' = 'playlists'; // Pestaña activa por defecto
  latestReleases: ReleaseItem[] = [];
  currentItemIndex = 0;
  isPlaying = false;
  private bannerInterval: any;
  isLoading = true;
  slideDirection: 'left' | 'right' = 'right';

  private musicPlayerService = inject(MusicPlayerService);
  
  constructor(
    private router: Router,
    private shortcutsService: ShortcutsService,
    private songService: SongService,
    private releaseService: ReleaseService
  ) {}

  ngOnInit(): void {
    this.loadShortcuts();
    this.loadLatestReleases();
  }

  ngOnDestroy(): void {
    this.clearBannerInterval();
  }

  private clearBannerInterval(): void {
    if (this.bannerInterval) {
      clearInterval(this.bannerInterval);
      this.bannerInterval = null;
    }
  }


  loadLatestReleases(): void {
    this.releaseService.getTopReleases().subscribe({
      next: (releases) => {
        this.latestReleases = releases;
        if (releases.length > 0) {
          this.setupCurrentItem();
          this.startBannerRotation();
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar lanzamientos', err);
        this.isLoading = false;
      }
    });
  }

  private setupCurrentItem(): void {
    // No se necesita lógica de inicialización ya que usamos MusicPlayerService
  }

  isSong(release: ReleaseItem): release is ReleaseItem & { youtubeUrl: string } {
    return release.type === 'song' && !!release.youtubeUrl;
  }

  private extractVideoId(url: string): string {
    if (!url) return '';
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return match && match[2] ? match[2].substring(0, 11) : '';
    } catch (error) {
      console.error('Error al extraer el ID del video:', error);
      return '';
    }
  }

  // El reproductor de YouTube ha sido reemplazado por MusicPlayerService

  togglePlay(): void {
    const currentItem = this.latestReleases[this.currentItemIndex];
    if (currentItem) {
      // Simulamos un evento de clic en el botón de reproducción
      const mockEvent = { stopPropagation: () => {} } as Event;
      this.playRelease(currentItem, mockEvent);
    }
  }

  nextBanner(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.slideDirection = 'right';
    this.currentItemIndex = (this.currentItemIndex + 1) % this.latestReleases.length;
    this.setupCurrentItem();
  }

  prevBanner(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.slideDirection = 'left';
    this.currentItemIndex = (this.currentItemIndex - 1 + this.latestReleases.length) % this.latestReleases.length;
    this.setupCurrentItem();
  }

  private startBannerRotation(): void {
    if (this.latestReleases.length <= 1) return;
    
    this.clearBannerInterval();
    
    this.bannerInterval = setInterval(() => {
      this.nextBanner();
    }, 10000);
  }

  goToRelease(release: ReleaseItem, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate([release.type === 'song' ? '/songs' : '/albums', release.id]);
  }

  async playRelease(release: ReleaseItem, event: Event): Promise<void> {
    event.stopPropagation();
    
    if (release.type === 'song') {
      // Para canciones, usar el MusicPlayerService
      const songResponse: SongResponse = {
        id: release.id,
        title: release.title,
        artistName: release.artistName,
        releaseDate: release.releaseDate,
        message: '', // Mensaje vacío por defecto
        artistId: 0, // Valor por defecto, se actualizará después
        youtubeUrl: release.youtubeUrl || '',
        isPublicSong: release.isPublicSong ?? true,
        imageUrl: release.imageUrl || undefined
      };

      // Extraer el ID del video de YouTube
      const videoId = release.youtubeUrl ? this.extractVideoId(release.youtubeUrl) : '';
      
      // Solo reproducir si tenemos un ID de video válido
      if (videoId) {
        this.musicPlayerService.loadSong(videoId, songResponse);
      } else {
        console.warn('No se pudo extraer el ID del video de YouTube');
        // Aquí podrías mostrar un mensaje al usuario
      }
    } else if (release.type === 'album' && release.songs && release.songs.length > 0) {
      // Para álbumes, reproducir la primera canción del álbum
      const firstSong = release.songs[0];
      
      // Verificar que la primera canción tenga una URL de YouTube
      if (!firstSong.youtubeUrl) {
        console.warn('La primera canción del álbum no tiene una URL de YouTube');
        return;
      }
      
      const songResponse: SongResponse = {
        id: firstSong.id,
        title: firstSong.title,
        artistName: release.artistName,
        releaseDate: firstSong.releaseDate,
        message: '', // Mensaje vacío por defecto
        artistId: 0, // Valor por defecto, se actualizará después
        youtubeUrl: firstSong.youtubeUrl || '',
        isPublicSong: true, // Asumimos que si está en un álbum es pública
        imageUrl: release.imageUrl || undefined
      };

      // Extraer el ID del video de YouTube de la primera canción
      const videoId = this.extractVideoId(firstSong.youtubeUrl);
      
      // Solo reproducir si tenemos un ID de video válido
      if (videoId) {
        this.musicPlayerService.loadSong(videoId, songResponse);
      } else {
        console.warn('No se pudo extraer el ID del video de YouTube para la primera canción del álbum');
        // Aquí podrías mostrar un mensaje al usuario
      }
    }
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = this.defaultCoverUrl;
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

  // Navegación
  goToPlaylist(playlistId: number) {
    this.router.navigate(['/playlist', playlistId]);
  }

  goToAlbum(albumId: number) {
    this.router.navigate(['/album', albumId]);
  }

  // Cambiar entre pestañas
  setActiveTab(tab: 'playlists' | 'albums') {
    this.activeTab = tab;
  }

  defaultCoverUrl = 'https://res.cloudinary.com/dgrrhrvbq/image/upload/v1751432187/Group_25_rnsf9v.png';

  getSafeImageUrl(imageUrl?: string | null): string {
    return imageUrl || this.defaultCoverUrl;
  }

}

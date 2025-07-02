import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlbumOptionsPopupComponent } from '../../components/album-options-popup/album-options-popup.component';
import { EditAlbumModalComponent } from '../../components/edit-album-modal/edit-album-modal.component';
import { DeleteAlbumModalComponent } from '../../components/delete-album-modal/delete-album-modal.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AlbumService } from '../../../../services/Album.service';
import { MusicPlayerService } from '../../../../services/music-player.service';
import { ShortcutsService } from '../../../../services/shortcuts.service';
import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';

// Interfaz para la respuesta de accesos directos
interface ShortcutsResponse {
  Playlists: any[];
  Albums: { id: number }[];
}

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
  imports: [
    CommonModule, 
    AlbumOptionsPopupComponent, 
    EditAlbumModalComponent, 
    DeleteAlbumModalComponent
  ],
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
  isInShortcuts = false;
  loadingShortcuts = false;

  async onAddAlbumToShortcut() {
    if (!this.album?.id || this.loadingShortcuts) return;
    
    this.loadingShortcuts = true;
    try {
      // Primero verificamos si ya está en accesos directos
      const isAlreadyInShortcuts = await firstValueFrom(
        this.shortcutsService.getShortcutsByUser().pipe(
          map((response: ShortcutsResponse) => {
            return response.Albums?.some(album => album.id === this.album?.id) || false;
          })
        )
      );

      // Si ya está en accesos directos, solo actualizamos el estado
      if (isAlreadyInShortcuts) {
        this.isInShortcuts = true;
        this.showMenu = false;
        return;
      }

      // Si no está en accesos directos, intentamos agregarlo
      try {
        await firstValueFrom(this.shortcutsService.addAlbumToShortcuts({ albumId: this.album.id }));
        this.isInShortcuts = true;
        this.showMenu = false;
      } catch (addError) {
        // Verificamos si el error es porque ya está en accesos directos
        const isInShortcuts = await firstValueFrom(
          this.shortcutsService.getShortcutsByUser().pipe(
            map((response: ShortcutsResponse) => {
              return response.Albums?.some(album => album.id === this.album?.id) || false;
            })
          )
        );

        if (isInShortcuts) {
          // Si está en accesos directos a pesar del error, lo consideramos éxito
          this.isInShortcuts = true;
          this.showMenu = false;
        } else {
          console.error('Error al agregar a accesos directos:', addError);
          alert('No se pudo agregar el álbum a accesos directos');
        }
      }
    } catch (error) {
      console.error('Error al verificar accesos directos:', error);
      alert('No se pudo verificar el estado de accesos directos');
    } finally {
      this.loadingShortcuts = false;
    }
  }

  async onRemoveAlbumFromShortcut() {
    if (!this.album?.id || this.loadingShortcuts) return;
    
    this.loadingShortcuts = true;
    try {
      await firstValueFrom(this.shortcutsService.removeAlbumFromShortcuts(this.album.id));
      this.isInShortcuts = false;
      this.showMenu = false;
    } catch (error) {
      console.error('Error al quitar de accesos directos:', error);
      alert('No se pudo quitar el álbum de accesos directos');
    } finally {
      this.loadingShortcuts = false;
    }
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
    private musicPlayerService: MusicPlayerService,
    private shortcutsService: ShortcutsService
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
    this.checkIfInShortcuts();
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

  public  goToArtistProfile() {
    this.router.navigate(['/artist/profile-artist']);
  }

  private checkIfInShortcuts() {
    this.route.paramMap.subscribe(params => {
      const albumId = params.get('id');
      if (!albumId) return;
      
      this.shortcutsService.getShortcutsByUser().subscribe({
        next: (response) => {
          this.isInShortcuts = response.Albums?.some(album => album.id === +albumId) || false;
        },
        error: (error) => {
          console.error('Error al verificar accesos directos:', error);
        }
      });
    });
  }
}

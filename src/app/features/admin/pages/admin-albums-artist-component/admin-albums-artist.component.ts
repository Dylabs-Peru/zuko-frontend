import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SongService } from '../../../../services/Song.service';
import { GenreService } from '../../../../services/genre.service';
import { AlbumService } from '../../../../services/Album.service';
import { ArtistService } from '../../../../services/Artist.service';
import { AlbumResponse } from '../../../../models/album.model';
import { ArtistResponse } from '../../../../models/artist.model';

@Component({
  selector: 'app-admin-albums-artist-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-albums-artist.component.html',
  styleUrls: ['./admin-albums-artist.component.css']
})
export class AdminAlbumsArtistComponent implements OnInit {
  onEditAlbum(album: any) {
    console.log('Editar álbum:', album);
  }
  onDeleteAlbum(album: any) {
    console.log('Eliminar álbum:', album);
  }
  showCreateAlbumModal = false;

  // Modal álbum state
  albumTab: 'info' | 'songs' = 'info';
  albumForm = {
    title: '',
    genreId: '',
    coverUrl: '',
    selectedSongIds: [] as number[]
  };
  fieldTouched = {
    title: false,
    genreId: false,
    songs: false
  };
  showAllErrors = false;
  minSongsRequired = 2;
  isSaving = false;
  showTabError = false;
  genres: { id: number; name: string }[] = [];
  songs: { id: number; name: string; artist: string; releaseDate: string; imageUrl?: string }[] = [];

  onCreateAlbum() {
    this.showCreateAlbumModal = true;
    this.albumTab = 'info';
    this.albumForm = { title: '', genreId: '', coverUrl: '', selectedSongIds: [] };
    this.fieldTouched = { title: false, genreId: false, songs: false };
    this.showAllErrors = false;
    this.isSaving = false;
    this.loadGenres();
    this.loadSongs();
  }

  onCloseCreateAlbumModal() {
    this.showCreateAlbumModal = false;
  }

  // Tabs control
  canGoToSongsTab(): boolean {
    return !!this.albumForm.title && !!this.albumForm.genreId;
  }

  // Verifica si se debe mostrar el error para un campo específico
  shouldShowError(fieldName: 'title' | 'genreId' | 'songs'): boolean {
    if (fieldName === 'songs') {
      return (this.fieldTouched.songs || this.showAllErrors) && this.albumForm.selectedSongIds.length < this.minSongsRequired;
    }
    return (this.fieldTouched[fieldName] || this.showAllErrors) && !this.albumForm[fieldName];
  }

  onTabClick(tab: 'info' | 'songs') {
    if (tab === 'songs' && !this.canGoToSongsTab()) {
      // Marcar todos los campos como tocados para mostrar errores
      this.showAllErrors = true;
      this.showTabError = true;
      // Ocultar el mensaje después de 3 segundos
      setTimeout(() => {
        this.showTabError = false;
      }, 3000);
      return;
    }
    
    this.showTabError = false;
    this.albumTab = tab;
  }

  // Marca un campo específico como tocado
  onFieldTouched(fieldName: 'title' | 'genreId') {
    this.fieldTouched[fieldName] = true;
  }
  
  onNextAlbumInfo() {
    this.showAllErrors = true;
    if (this.canGoToSongsTab()) {
      this.albumTab = 'songs';
    }
  }

  // Portada
  onAlbumCoverSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.albumForm.coverUrl = e.target.result;
      };
      reader.readAsDataURL(file);
      // Subir a Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'zuko_pfps');
      fetch('https://api.cloudinary.com/v1_1/dqk8inmwe/image/upload', {
        method: 'POST',
        body: formData
      })
        .then(response => response.json())
        .then(data => {
          if (data.secure_url) {
            this.albumForm.coverUrl = data.secure_url;
          } else {
            alert('Error al subir la portada');
            this.albumForm.coverUrl = '';
          }
        })
        .catch(() => {
          alert('Error al subir la portada');
          this.albumForm.coverUrl = '';
        });
    }
  }
  removeAlbumCover() {
    this.albumForm.coverUrl = '';
  }

  // Canciones y géneros
  loadGenres() {
    this.genreService.get_genres().subscribe({
      next: (genres: any[]) => {
        this.genres = genres;
      },
      error: () => { this.genres = []; }
    });
  }
  loadSongs() {
    if (!this.artist?.id) {
      this.songs = [];
      return;
    }
    
    this.songService.getSongsByArtist(this.artist.id).subscribe({
      next: (songs) => {
        this.songs = songs.map(song => ({
          id: song.id,
          name: song.title,
          artist: song.artistName,
          releaseDate: song.releaseDate || '',
          imageUrl: song.imageUrl || ''
        }));
      },
      error: () => { 
        console.error('Error al cargar las canciones del artista');
        this.songs = []; 
      }
    });
  }
  toggleAlbumSongSelection(id: number) {
    if (this.albumForm.selectedSongIds.includes(id)) {
      this.albumForm.selectedSongIds = this.albumForm.selectedSongIds.filter(sid => sid !== id);
    } else {
      this.albumForm.selectedSongIds.push(id);
    }
    // Marcar como tocado cuando se selecciona/deselecciona una canción
    this.fieldTouched.songs = true;
  }

  // Guardar álbum
  onSaveAlbum() {
    // Marcar todos los campos como tocados para mostrar errores
    this.showAllErrors = true;
    this.fieldTouched.songs = true;
    
    // Validar que todos los campos requeridos estén completos
    if (!this.albumForm.title || !this.albumForm.genreId || this.albumForm.selectedSongIds.length < this.minSongsRequired) {
      // Mostrar mensaje de error
      this.showTabError = true;
      setTimeout(() => {
        this.showTabError = false;
      }, 3000);
      return;
    }
    
    this.isSaving = true;
    
    // Obtener artistId del usuario autenticado
    const auth = localStorage.getItem('auth');
    let artistId: number | undefined = undefined;
    if (auth) {
      const authObj = JSON.parse(auth);
      artistId = authObj?.user?.artistId;
    }
    
    // Preparar canciones (solo { title })
    const selectedSongs = this.songs.filter(song => this.albumForm.selectedSongIds.includes(song.id));
    const songs = selectedSongs.map(song => ({ title: song.name }));
    const cover = this.albumForm.coverUrl || '';
    const releaseYear = new Date().getFullYear();
    
    // Crear objeto de solicitud
    const albumRequest: any = {
      title: this.albumForm.title,
      releaseYear,
      cover,
      genreId: this.albumForm.genreId,
      songs
    };
    
    if (artistId) {
      albumRequest.artistId = artistId;
    }
    
    // Usar el servicio para crear el álbum
    this.albumService.createAlbum(albumRequest).subscribe({
      next: (response) => {
        this.onAlbumCreated();
      },
      error: (error) => {
        console.error('Error al crear álbum:', error);
        
        // Manejar diferentes tipos de errores
        if (error.status === 409) {
          // Mostrar mensaje de error al usuario (álbum duplicado)
          console.error('Ya existe un álbum con ese título');
        } else {
          // Mostrar mensaje de error genérico
          console.error('Error al crear álbum');
        }
      },
      complete: () => {
        this.isSaving = false;
      }
    });
  }
  artist: ArtistResponse | null = null;
  albums: AlbumResponse[] = [];
  loading = false;

  // Refresca lista tras crear álbum
  onAlbumCreated() {
    if (this.artist) {
      this.loading = true;
      this.albumService.getAlbumsByArtist(this.artist.id).subscribe({
        next: (albums) => {
          this.albums = albums;
          this.loading = false;
        },
        error: () => { this.loading = false; }
      });
    }
    this.showCreateAlbumModal = false;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private albumService: AlbumService,
    private artistService: ArtistService,
    private songService: SongService,
    private genreService: GenreService
  ) {}

  ngOnInit(): void {
    const artistId = Number(this.route.snapshot.paramMap.get('id'));
    if (!artistId) {
      this.router.navigate(['/admin/albums']);
      return;
    }
    this.loading = true;
    this.artistService.getArtistById(artistId).subscribe({
      next: (artist) => {
        this.artist = (artist as any).data;
        this.albumService.getAlbumsByArtist(artistId).subscribe({
          next: (albums) => {
            this.albums = albums;
            this.loading = false;
          },
          error: () => { this.loading = false; }
        });
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/admin/albums']);
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin/albums']);
  }
}

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
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-admin-albums-artist-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-albums-artist.component.html',
  styleUrls: ['./admin-albums-artist.component.css']
})
export class AdminAlbumsArtistComponent implements OnInit {
  // Propiedades del componente
  showCreateAlbumModal = false;
  isEditing = false;
  currentAlbumId: number | null = null;
  albumToEdit: any = null;
  albumToDelete: any = null; // Nuevo: Álbum que se va a eliminar
  showDeleteConfirmModal = false; // Nuevo: Controla la visibilidad del modal de confirmación
  isDeleting = false; // Nuevo: Estado de carga durante la eliminación
  artist: any = null;
  albums: any[] = [];
  loading = false;

  // Estado del modal de álbum
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
  
  // Datos para el formulario
  genres: any[] = [];
  songs: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private albumService: AlbumService,
    private artistService: ArtistService,
    private songService: SongService,
    private genreService: GenreService
  ) {}

  async onEditAlbum(album: any) {
    console.log('Editando álbum:', album);
    this.isEditing = true;
    this.currentAlbumId = album.id;
    this.albumToEdit = JSON.parse(JSON.stringify(album)); // Copia profunda del álbum
    this.albumTab = 'info';
    
    // Inicializar el formulario con los datos del álbum
    this.albumForm = {
      title: album.title,
      genreId: album.genreId.toString(),
      coverUrl: album.cover || '',
      selectedSongIds: [] // Inicializar vacío, lo llenaremos después de cargar las canciones
    };

    console.log('IDs de canciones del álbum a editar:', album.songs?.map((s: any) => s.id) || []);

    // Cargar géneros
    this.loadGenres();
    
    // Cargar canciones y luego establecer las seleccionadas
    await this.loadSongs().then(() => {
      // Después de cargar las canciones, establecer las seleccionadas
      if (album.songs && album.songs.length > 0) {
        this.albumForm.selectedSongIds = album.songs.map((s: any) => s.id);
        console.log('Canciones seleccionadas después de cargar:', this.albumForm.selectedSongIds);
      }
    });
    
    // Mostrar el modal
    this.showCreateAlbumModal = true;
  }
  // Mostrar confirmación para eliminar álbum
  onDeleteAlbum(album: any) {
    this.albumToDelete = album;
    this.showDeleteConfirmModal = true;
  }

  // Cerrar el modal de confirmación sin eliminar
  onCancelDelete() {
    this.showDeleteConfirmModal = false;
    this.albumToDelete = null;
  }

  // Confirmar y ejecutar la eliminación del álbum
  async onConfirmDelete() {
    if (!this.albumToDelete) return;

    this.isDeleting = true;
    try {
      await this.albumService.deleteAlbum(this.albumToDelete.id).toPromise();
      console.log('Álbum eliminado exitosamente');
      
      // Cerrar el modal
      this.showDeleteConfirmModal = false;
      
      // Limpiar el álbum que se está editando si es el mismo que se eliminó
      if (this.albumToEdit && this.albumToEdit.id === this.albumToDelete.id) {
        this.albumToEdit = null;
        this.showCreateAlbumModal = false;
      }
      
      // Actualizar la lista de álbumes
      await new Promise<void>((resolve) => {
        this.albumService.getAlbumsByArtist(this.artist.id).subscribe({
          next: (albums: any[]) => {
            this.albums = albums;
            // Forzar la detección de cambios
            this.loading = false;
            resolve();
          },
          error: (error: any) => {
            console.error('Error al actualizar la lista de álbumes:', error);
            this.albums = []; // Asegurarse de que la lista esté vacía
            this.loading = false;
            resolve();
          }
        });
      });
      
    } catch (error) {
      console.error('Error al eliminar el álbum:', error);
      // Aquí podrías mostrar un mensaje de error al usuario
    } finally {
      this.isDeleting = false;
      this.albumToDelete = null;
    }
  }

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
    this.isEditing = false;
    this.currentAlbumId = null;
    this.albumToEdit = null;
    this.albumForm = { 
      title: '', 
      genreId: '', 
      coverUrl: '', 
      selectedSongIds: [] 
    };
    this.fieldTouched = { 
      title: false, 
      genreId: false, 
      songs: false 
    };
    this.showAllErrors = false;
    this.albumTab = 'info';
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

  // Cargar géneros
  loadGenres(): void {
    this.genreService.get_genres().subscribe({
      next: (genres: any[]) => {
        this.genres = genres;
      },
      error: (error: any) => { 
        console.error('Error al cargar los géneros:', error);
        this.genres = []; 
      }
    });
  }
  // Cargar canciones públicas del artista
  loadSongs(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.artist?.id) {
        console.log('No hay ID de artista disponible');
        this.songs = [];
        resolve();
        return;
      }
      
      console.log('Cargando canciones públicas para el artista ID:', this.artist.id);
      
      this.songService.getSongsByArtist(this.artist.id).subscribe({
        next: (songs: any[]) => {
          console.log('Canciones recibidas del servicio:', songs);
          
          // Filtrar solo las canciones públicas
          const publicSongs = songs.filter(song => song.isPublicSong === true);
          
          this.songs = publicSongs.map(song => ({
            id: song.id,
            name: song.title,
            artist: song.artistName || 'Artista desconocido',
            releaseDate: song.releaseDate || '',
            imageUrl: song.imageUrl || '',
            isPublicSong: true // Asegurarse de que todas las canciones mostradas sean públicas
          }));
          
          console.log('Lista de canciones públicas procesada:', this.songs);
          resolve();
        },
        error: (error: any) => { 
          console.error('Error al cargar las canciones del artista:', error);
          this.songs = [];
          reject(error);
        }
      });
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
  async onSaveAlbum(): Promise<void> {
    console.log('Iniciando guardado de álbum...');
    // Marcar todos los campos como tocados para mostrar errores
    this.showAllErrors = true;
    this.fieldTouched.songs = true;
    
    // Validar que todos los campos requeridos estén completos
    if (!this.albumForm.title || !this.albumForm.genreId || this.albumForm.selectedSongIds.length < this.minSongsRequired) {
      alert(`Por favor completa todos los campos obligatorios y asegúrate de seleccionar al menos ${this.minSongsRequired} canciones.`);
      console.log('Validación fallida:', {
        title: this.albumForm.title,
        genreId: this.albumForm.genreId,
        songs: this.albumForm.selectedSongIds.length
      });
      return;
    }

    this.isSaving = true;
    
    try {
      // Obtener el ID del artista de la ruta actual y convertirlo a número
      const artistId = parseInt(this.route.snapshot.paramMap.get('id') || '0', 10);
      if (!artistId) {
        throw new Error('No se pudo obtener el ID del artista de la ruta');
      }
      
      // Obtener las canciones seleccionadas con sus títulos
      const selectedSongs = this.songs.filter(song => 
        this.albumForm.selectedSongIds.includes(song.id)
      );
      
      // Verificar que todas las canciones seleccionadas sean públicas
      const nonPublicSongs = selectedSongs.filter(song => song.isPublicSong === false);
      if (nonPublicSongs.length > 0) {
        throw new Error('No se pueden incluir canciones privadas en un álbum. Por favor, verifica las canciones seleccionadas.');
      }
      
      // Crear el objeto del álbum para enviar al backend
      const albumData = {
        title: this.albumForm.title,
        releaseYear: new Date().getFullYear(),
        cover: this.albumForm.coverUrl || '',
        genreId: parseInt(this.albumForm.genreId, 10),
        artistId: artistId,
        // Enviar las canciones en el formato que espera el backend
        songs: selectedSongs.map(song => ({
          title: song.name || song.title,
          isPublicSong: true // Asegurar que solo se envíen canciones públicas
        }))
      };
      
      console.log('Datos del álbum a guardar:', JSON.stringify(albumData, null, 2));
      
      console.log('Datos que se enviarán al backend:', JSON.stringify(albumData, null, 2));
      
      // Determinar la URL y el método HTTP según si es edición o creación
      const url = this.isEditing && this.currentAlbumId
        ? `${environment.apiUrl}/albums/${this.currentAlbumId}`
        : `${environment.apiUrl}/albums`;
        
      const method = this.isEditing && this.currentAlbumId ? 'PUT' : 'POST';
      
      console.log(`Enviando solicitud ${method} a: ${url}`);
      
      // Obtener el token de autenticación
      const token = localStorage.getItem('token');
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(albumData)
      });
      
      console.log('Respuesta del servidor - Estado:', response.status, response.statusText);
      
      // Clonar la respuesta para poder leer el cuerpo dos veces (para logging y para el error)
      const responseClone = response.clone();
      
      if (!response.ok) {
        // Intentar obtener el cuerpo del error
        let errorBody;
        try {
          errorBody = await responseClone.json();
          console.error('Cuerpo del error del servidor:', JSON.stringify(errorBody, null, 2));
        } catch (e) {
          console.error('No se pudo parsear el cuerpo del error:', e);
          const text = await responseClone.text();
          console.error('Respuesta en texto plano:', text);
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        // Lanzar un error con toda la información disponible
        const errorMessage = errorBody?.detail || 
                           errorBody?.message || 
                           `Error ${response.status}: ${response.statusText}`;
                            
        console.error('Mensaje de error:', errorMessage);
        throw new Error(errorMessage);
      }
      
      // Si todo salió bien, obtener los datos de la respuesta
      const data = await response.json();
      console.log('Álbum guardado exitosamente:', data);
      
      // Cerrar el modal y recargar la lista
      this.onCloseCreateAlbumModal();
      this.loadAlbums();
      
      return data;
      
    } catch (error) {
      console.error('Error al guardar el álbum:', error);
      alert(error instanceof Error ? error.message : 'Ocurrió un error al guardar el álbum');
      throw error;
    } finally {
      this.isSaving = false;
    }
  }


  // Cargar la lista de álbumes
  loadAlbums(): void {
    if (this.artist?.id) {
      this.loading = true;
      this.albumService.getAlbumsByArtist(this.artist.id).subscribe({
        next: (albums: any[]) => {
          this.albums = albums;
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error al cargar los álbumes:', error);
          this.loading = false;
        }
      });
    }
  }
  
  // Refresca lista tras crear/editar álbum
  onAlbumCreated(): void {
    this.loadAlbums();
    this.showCreateAlbumModal = false;
  }

  ngOnInit(): void {
    const artistId = Number(this.route.snapshot.paramMap.get('id'));
    if (!artistId) {
      this.router.navigate(['/admin/albums']);
      return;
    }
    
    this.loading = true;
    this.artistService.getArtistById(artistId).subscribe({
      next: (artist: any) => {
        this.artist = artist.data;
        this.loadGenres();
        this.loadSongs();
        this.loadAlbums();
      },
      error: (error: any) => {
        console.error('Error al cargar el artista:', error);
        this.loading = false;
        this.router.navigate(['/admin/albums']);
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin/albums']);
  }
}

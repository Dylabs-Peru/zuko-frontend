import { Component, EventEmitter, Output, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListGenresComponent } from '../../../genre/pages/list_genres/list-genres.component';
import { SongService } from '../../../../services/Song.service';
import { SongResponse } from '../../../../models/song.model';

@Component({
  selector: 'app-create-album-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ListGenresComponent],
  templateUrl: './create-album-modal.component.html',
  styleUrls: ['./create-album-modal.component.css']
})

export class CreateAlbumModalComponent implements OnInit, OnChanges {
  isSaving = false;
  coverUrl: string = '';


  @Input() show = false;
  @Output() close = new EventEmitter<void>();
  @Output() albumCreated = new EventEmitter<any>();

  title = '';
  genreId: number|null = null;
  genreName: string = '';
  tab: 'info' | 'songs' = 'info';

  // Canciones del álbum
  songs: { id: number; name: string; artist: string; releaseDate: string; imageUrl?: string; isPublicSong?: boolean }[] = [];
  selectedSongIds: number[] = [];


  constructor(private songService: SongService) {}

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['show'] && changes['show'].currentValue) {
      this.loadSongs();
    }
  }

  loadSongs() {
    this.songService.getMySongs().subscribe({
      next: (songs: SongResponse[]) => {
        // Filtrar solo las canciones públicas
        const publicSongs = songs.filter(song => song.isPublicSong === true);
        
        this.songs = publicSongs.map(song => ({
          id: song.id,
          name: song.title,
          artist: song.artistName,
          releaseDate: song.releaseDate || '',
          imageUrl: song.imageUrl || '',
          isPublicSong: true // Asegurarse de que todas las canciones mostradas sean públicas
        }));
        
        console.log('Canciones públicas cargadas para selección:', this.songs);
      },
      error: (err) => {
        console.error('Error al cargar las canciones:', err);
        this.songs = [];
      }
    });
  }

  selectTab(tab: 'info' | 'songs') {
    this.tab = tab;
  }

  onGenreSelected(id: number) {
    this.genreId = id;
    // Opcional: Buscar el nombre del género si lo necesitas para mostrar
    // Aquí podrías hacer una búsqueda en el servicio si quieres el nombre
  }

  onCoverSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Preview local mientras sube
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.coverUrl = e.target.result;
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
            this.coverUrl = data.secure_url;
          } else {
            alert('Error al subir la portada');
            this.coverUrl = '';
          }
        })
        .catch(() => {
          alert('Error al subir la portada');
          this.coverUrl = '';
        });
    }
  }

  removeCover() {
    this.coverUrl = '';
  }

  deleteSong(index: number) {
    this.songs.splice(index, 1);
  }

  toggleSongSelection(id: number) {
    if (this.selectedSongIds.includes(id)) {
      this.selectedSongIds = this.selectedSongIds.filter(sid => sid !== id);
    } else {
      this.selectedSongIds.push(id);
    }
  }

  async saveSongs() {
    if (!this.title || !this.genreId || this.selectedSongIds.length < 2) return;
    this.isSaving = true;
    try {
      // Obtener artistId del usuario autenticado
      const auth = localStorage.getItem('auth');
      let artistId: number | undefined = undefined;
      if (auth) {
        const authObj = JSON.parse(auth);
        artistId = authObj?.user?.artistId;
        if (!artistId) {
          throw new Error('No se pudo obtener el ID del artista. Por favor, inicia sesión nuevamente.');
        }
      } else {
        throw new Error('No se encontró la información de autenticación. Por favor, inicia sesión nuevamente.');
      }
      
      // Obtener las canciones seleccionadas con toda su información
      const selectedSongs = this.songs.filter(song => this.selectedSongIds.includes(song.id));
      
      // Verificar que todas las canciones sean públicas
      const nonPublicSongs = selectedSongs.filter(song => !song.isPublicSong);
      if (nonPublicSongs.length > 0) {
        throw new Error('Algunas canciones seleccionadas no son públicas. Por favor, verifica las canciones e inténtalo de nuevo.');
      }
      
      // Preparar el array de canciones con el formato esperado por el backend
      const songs = selectedSongs.map(song => ({
        title: song.name,
        isPublicSong: true
      }));
      
      // Portada (base64 o vacío)
      const cover = this.coverUrl || '';
      // Año actual
      const releaseYear = new Date().getFullYear();
      // Construir AlbumRequest con el formato esperado
      const albumRequest = {
        title: this.title,
        releaseYear,
        cover,
        genreId: Number(this.genreId), // Asegurar que sea un número
        songs,
        artistId: Number(artistId) // Incluir el artistId
      };
      // Enviar al backend
      const response = await fetch('http://localhost:8080/api/v1/albums', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(albumRequest)
      });
      if (!response.ok) {
        if (response.status === 409) {
          // Error por título duplicado
          throw new Error('El título del álbum ya existe para este artista.');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear álbum');
      }
      const data = await response.json();
      alert('Álbum creado correctamente');
      // Despacha el evento global para actualizar la lista de álbumes
      window.dispatchEvent(new Event('albumCreated'));

      this.albumCreated.emit(data.data);
      this.resetForm();
      this.close.emit();
    } catch (err: any) {
      alert(err.message || 'Error al crear álbum');
    } finally {
      this.isSaving = false;
    }
  }

  resetForm() {
    this.title = '';
    this.genreId = null;
    this.genreName = '';
    this.coverUrl = '';
    this.selectedSongIds = [];
    this.tab = 'info';
  }

  saveAlbum() {
    if (!this.title || !this.genreId) return;
    this.albumCreated.emit({ title: this.title, genreId: this.genreId });
    this.close.emit();
  }

  onClose() {
    this.resetForm();
    this.close.emit();
  }
}

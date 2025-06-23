import { Component, EventEmitter, Output, Input } from '@angular/core';
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

export class CreateAlbumModalComponent {
  isSaving = false;
  coverUrl: string | null = null;
  coverFile: File | null = null;


  @Input() show = false;
  @Output() close = new EventEmitter<void>();
  @Output() albumCreated = new EventEmitter<any>();

  title = '';
  genreId: number|null = null;
  genreName: string = '';
  tab: 'info' | 'songs' = 'info';

  // Canciones del álbum (mock por ahora)
  songs: { id: number; name: string; artist: string; releaseDate: string }[] = [];
  selectedSongIds: number[] = [];


  constructor(private songService: SongService) {}

  ngOnInit() {
    this.loadSongs();
  }

  loadSongs() {
    this.songService.getMySongs().subscribe({
      next: (songs: SongResponse[]) => {
        this.songs = songs.map(song => ({
          id: song.id,
          name: song.title,
          artist: song.artistName,
          releaseDate: song.releaseDate || ''
        }));
      },
      error: (err) => {
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
      this.coverFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.coverUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeCover() {
    this.coverUrl = null;
    this.coverFile = null;
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
      let artistId = null;
      if (auth) {
        const authObj = JSON.parse(auth);
        // Usa el id del artista, no el del usuario
        artistId = authObj?.user?.artistId;
        // Si no existe en el objeto auth, asigna manualmente el id del artista encontrado en la base de datos
        if (!artistId) {
          artistId = 4; // <-- Ajusta este valor si el id de artista cambia
        }
      }
      if (!artistId) throw new Error('No se pudo obtener el id del artista autenticado (artistId).');
      // Preparar canciones
      const selectedSongs = this.songs.filter(song => this.selectedSongIds.includes(song.id));
      const songs = selectedSongs.map(song => ({
        title: song.name,
        isPublicSong: true, // O usa el valor real si lo tienes
        artistId: artistId
      }));
      // Portada (base64 o vacío)
      const cover = this.coverUrl || '';
      // Año actual
      const releaseYear = new Date().getFullYear();
      // Construir AlbumRequest
      const albumRequest = {
        title: this.title,
        releaseYear,
        cover,
        genreId: this.genreId,
        artistId,
        songs
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear álbum');
      }
      const data = await response.json();
      alert('Álbum creado correctamente');
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
    this.coverUrl = null;
    this.coverFile = null;
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

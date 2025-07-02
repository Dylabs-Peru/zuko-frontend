import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListGenresComponent } from '../../../genre/pages/list_genres/list-genres.component';
import { AlbumService } from '../../../../services/Album.service';
import { SongService } from '../../../../services/Song.service';
import { SongResponse } from '../../../../models/song.model';

@Component({
  selector: 'app-edit-album-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ListGenresComponent],
  templateUrl: './edit-album-modal.component.html',
  styleUrls: ['./edit-album-modal.component.css']
})
export class EditAlbumModalComponent implements OnChanges {
  @Input() show = false;
  @Input() album: any = null; // Recibe el álbum a editar
  @Output() close = new EventEmitter<void>();
  @Output() albumEdited = new EventEmitter<void>();

  tab: 'info' | 'songs' = 'info';

  editTitle: string = '';
  editGenreId: number|null = null;
  isSaving: boolean = false;

  // Portada
  coverUrl: string = '';
  coverFile: File | null = null;

  // Canciones
  songs: SongResponse[] = [];
  selectedSongIds: number[] = [];
  isLoadingSongs: boolean = false;

  constructor(private albumService: AlbumService, private songService: SongService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['album'] && this.album) {
      this.editTitle = this.album.title || '';

      this.editGenreId = this.album.genreId !== undefined && this.album.genreId !== null ? Number(this.album.genreId) : null;
      // Portada actual
      this.coverUrl = this.album.cover || '';
      this.coverFile = null;
      // Preselecciona canciones del álbum (por id si hay, si no por title)
      this.selectedSongIds = [];
      this.loadSongs();
    }
  }

  loadSongs() {
    this.isLoadingSongs = true;
    this.songService.getMySongs().subscribe({
      next: (songs: SongResponse[]) => {
        // Filtrar solo las canciones públicas
        const publicSongs = songs.filter(song => song.isPublicSong === true);
        this.songs = publicSongs;
        
        // Preselecciona por id si hay, si no por title
        if (this.album?.songs?.length) {
          this.selectedSongIds = publicSongs
            .filter(song => this.album.songs.some((alSong: any) => (alSong.id && alSong.id === song.id) || (alSong.title && alSong.title === song.title)))
            .map(song => song.id);
            
          console.log('Canciones públicas cargadas para edición:', this.songs);
          console.log('Canciones seleccionadas en el álbum:', this.selectedSongIds);
        }
        this.isLoadingSongs = false;
      },
      error: (error) => {
        console.error('Error al cargar las canciones:', error);
        this.songs = [];
        this.isLoadingSongs = false;
      }
    });
  }

  selectTab(tab: 'info' | 'songs') {
    this.tab = tab;
  }

  toggleSongSelection(songId: number) {
    if (this.selectedSongIds.includes(songId)) {
      this.selectedSongIds = this.selectedSongIds.filter(id => id !== songId);
    } else {
      this.selectedSongIds = [...this.selectedSongIds, songId];
    }
  }

  onClose() {
    this.close.emit();
  }

  onSave() {
    if (!this.editTitle || !this.editGenreId || this.selectedSongIds.length < 2) {
      alert('Por favor completa todos los campos obligatorios y selecciona al menos 2 canciones.');
      return;
    }
    
    // Verificar que todas las canciones seleccionadas existan en la lista actual
    const selectedSongs = this.songs.filter(song => this.selectedSongIds.includes(song.id));
    if (selectedSongs.length !== this.selectedSongIds.length) {
      alert('Una o más canciones seleccionadas no existen o no pertenecen al artista. Actualiza la lista y vuelve a intentarlo.');
      return;
    }
    
    // Verificar que todas las canciones sean públicas
    const nonPublicSongs = selectedSongs.filter(song => !song.isPublicSong);
    if (nonPublicSongs.length > 0) {
      alert('Algunas canciones seleccionadas no son públicas. Por favor, verifica las canciones e inténtalo de nuevo.');
      return;
    }
    
    this.isSaving = true;
    
    // Si la portada es base64 y no URL, no la envíes (o envía la original)
    let coverToSend = this.coverUrl;
    if (this.coverUrl && this.coverUrl.startsWith('data:image')) {
      coverToSend = this.album.cover || '';
    }
    
    // Obtener el artistId del álbum actual
    const artistId = this.album.artistId;
    if (!artistId) {
      alert('No se pudo obtener el ID del artista. Por favor, inténtalo de nuevo.');
      this.isSaving = false;
      return;
    }

    // Preparar el payload con el formato esperado por el backend
    const updateData = {
      title: this.editTitle,
      releaseYear: this.album.releaseYear || new Date().getFullYear(),
      artistId: Number(artistId), // Asegurar que sea un número
      genreId: Number(this.editGenreId), // Asegurar que sea un número
      cover: coverToSend,
      songs: selectedSongs.map(song => ({
        id: song.id, // Incluir el ID de la canción
        title: song.title,
        isPublicSong: true, // Asegurar que solo se envíen canciones públicas
        artistId: Number(artistId) // Incluir el artistId en cada canción
      }))
    };
    
    this.albumService.updateAlbum(this.album.id, updateData).subscribe({
      next: () => {
        this.isSaving = false;
        this.albumEdited.emit();
        this.close.emit();
      },
      error: (err: any) => {
        this.isSaving = false;
        let msg = 'Error al editar álbum';
        if (err && err.status === 409) {
          msg = 'El título del álbum ya existe para este artista.';
        } else if (err && err.error && err.error.message) {
          msg = err.error.message;
        }
        alert(msg);
      }
    });
  }

  async onCoverSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.coverFile = file;
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
      try {
        const response = await fetch('https://api.cloudinary.com/v1_1/dqk8inmwe/image/upload', {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        if (data.secure_url) {
          this.coverUrl = data.secure_url;
        } else {
          alert('Error al subir la portada');
          this.coverUrl = '';
        }
      } catch {
        alert('Error al subir la portada');
        this.coverUrl = '';
      }
    }
  }

  removeCover() {
    this.coverUrl = '';
    this.coverFile = null;
  }
}

import { Component, OnInit } from '@angular/core';
import { GenreService } from './genre.service';
import { GenreRequest, GenreResponse } from './genre.model';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-genre',
  imports: [NgIf,NgFor, FormsModule],
  templateUrl: './genre.component.html',
  styleUrl: './genre.component.css'
})
export class GenreComponent implements OnInit{
  genres: GenreResponse[] = [];
  error: string = '';
  newGenre: GenreRequest = { name: '', description: '' };
  createSuccess: boolean = false;
  createError: string = '';
  selectedGenreId: number | null = null;
  editingGenre: GenreRequest | null = null;
  editSuccess = false;
  editError = '';
  selectedDeleteGenreId: number | null = null;
  deleteSuccess = false;
  deleteError = '';


  constructor(private genreService: GenreService) {}

  ngOnInit(): void {
    this.loadGenres();
  }
  loadGenres(): void {
    this.genreService.get_genres().subscribe({
      next: (data) => {
        console.log('Genres loaded:', data);
        this.genres = data;
      },
      error: (err) => {
        this.error = 'Failed to load genres';
        console.error(err);
      }
    });
  }
  onCreateGenre(): void {
    this.createSuccess = false;
    this.createError = '';
    if (!this.newGenre.name || this.newGenre.name.length < 3) {
      this.createError = 'El nombre del género debe tener al menos 3 caracteres';
      return;
    }
    if (this.newGenre.description && this.newGenre.description.length >200) {
      this.createError = 'La descripción del género no puede exceder los 200 caracteres';
      return;
    }
    this.genreService.create_genre(this.newGenre).subscribe({
      next: (res) => {
        this.createSuccess = true;
        this.newGenre = { name: '', description: '' }; // Limpia el form
        this.loadGenres(); // Recarga la lista
      },
      error: (err) => {
        this.createError = err?.error?.message || 'Error al crear el género';
      }
    });
  }

  onSelectGenre(): void {
    // Busca el género seleccionado en la lista
    const genre = this.genres.find(g => g.id === this.selectedGenreId);
    // Precarga los datos en el form de edición (haz una copia para no mutar el original)
    if (genre) {
      this.editingGenre = { name: genre.name, description: genre.description };
      this.editSuccess = false;
      this.editError = '';
    } else {
      this.editingGenre = null;
    }
  }

onUpdateGenre(): void {
  if (!this.editingGenre || !this.selectedGenreId) return;
  this.genreService.update_genre(this.selectedGenreId, this.editingGenre).subscribe({
    next: (res) => {
      this.editSuccess = true;
      this.editError = '';
      this.loadGenres(); // refresca la lista
    },
    error: (err) => {
      this.editError = err?.error?.message || 'Error al actualizar el género';
      this.editSuccess = false;
    }
  });
}

onDeleteGenre(): void {
  if (!this.selectedDeleteGenreId) return;
  if (!confirm('¿Seguro que quieres eliminar este género?')) return;
  this.genreService.delete_genre(this.selectedDeleteGenreId).subscribe({
    next: () => {
      this.deleteSuccess = true;
      this.deleteError = '';
      this.selectedDeleteGenreId = null; // Limpia la selección
      this.loadGenres();
    },
    error: (err) => {
      this.deleteError = err?.error?.message || 'Error al eliminar el género';
      this.deleteSuccess = false;
    }
  });
}



}

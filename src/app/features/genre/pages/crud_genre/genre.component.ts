import { Component, OnInit, ViewChild } from '@angular/core';
import { GenreService } from '../../../../services/genre.service';
import { GenreRequest, GenreResponse } from '../../../../models/genre.model';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
@Component({
  selector: 'app-genre',
  imports: [NgIf,NgFor, FormsModule],
  templateUrl: './genre.component.html',
  styleUrl: './genre.component.css'
})
export class GenreComponent implements OnInit{
  @ViewChild('genreForm') genreForm!: NgForm; 
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
        this.newGenre = { name: '', description: '' }; 
        this.loadGenres(); 
        setTimeout(() => {
          this.genreForm.resetForm();
        });
        setTimeout(() => {
          this.createSuccess = false; 
        }
        , 2000); 
    },
      error: (err) => {
        this.createError = err?.error?.detail || 'Error al crear el género';
      }
    });
  }

  onSelectGenre(): void {

    const genre = this.genres.find(g => g.id === this.selectedGenreId);

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
      this.loadGenres(); 
      setTimeout(() => {
        this.editSuccess = false; 
        this.editingGenre = null; 
        this.selectedGenreId = null; 
      }
      , 2000);
    },
    error: (err) => {
      this.editError = err?.error?.detail || 'Error al actualizar el género';
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
      this.selectedDeleteGenreId = null; 
      this.loadGenres();
      setTimeout(() => {
        this.deleteSuccess = false; 
      }, 2000);
    },
    error: (err) => {
      this.deleteError = err?.error?.detail || 'Error al eliminar el género';
      this.deleteSuccess = false;
    }
  });
}



}

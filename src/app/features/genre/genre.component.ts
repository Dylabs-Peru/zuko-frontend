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

}

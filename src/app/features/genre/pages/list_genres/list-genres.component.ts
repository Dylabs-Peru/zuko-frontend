import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { GenreService } from './../../../../services/genre.service';
import { GenreResponse } from './../../../../models/genre.model';
import { NgFor, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-list-genres',
  standalone: true,
  imports: [NgFor, FormsModule, CommonModule],
  templateUrl: './list-genres.component.html',
  styleUrls: ['./list-genres.component.css']
})
export class ListGenresComponent implements OnInit {
  genres: GenreResponse[] = [];
  error: string = '';
  @Input() selectedGenre: number | null = null;

  ngOnChanges() {
    console.log('DEBUG ListGenresComponent ngOnChanges:', { selectedGenre: this.selectedGenre });
    if (this.selectedGenre !== null) {
      this.selectedGenre = Number(this.selectedGenre);
    }
  }
  @Output() selectedGenreChange = new EventEmitter<number>();
  @Output() genreSelected = new EventEmitter<number>();

  constructor(private genreService: GenreService) {}

  ngOnInit(): void {
    this.loadGenres();
  }

  loadGenres(): void {
    this.genreService.get_genres().subscribe({
      next: (data) => {
        this.genres = data;
        console.log('DEBUG ListGenresComponent loadGenres:', { selectedGenre: this.selectedGenre, genres: this.genres });
      // Asegura que el valor seleccionado sea number y esté en la lista
      if (this.selectedGenre !== null) {
        this.selectedGenre = Number(this.selectedGenre);
        const match = this.genres.find(g => Number(g.id) === this.selectedGenre);
        if (!match) {
          this.selectedGenre = null;
        }
      }
      },
      error: (err) => {
        this.error = 'Error al cargar géneros';
        console.error(err);
      }
    });
  }

  onGenreChange() {
    if (this.selectedGenre !== null) {
      this.genreSelected.emit(this.selectedGenre);
      this.selectedGenreChange.emit(this.selectedGenre);
    } 
  }
}
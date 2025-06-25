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
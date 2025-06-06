import { Component, OnInit } from '@angular/core';
import { GenreService } from './genre.service';
import { GenreResponse } from './genre.model';
import { NgFor, NgIf } from '@angular/common';
@Component({
  selector: 'app-genre',
  imports: [NgIf,NgFor],
  templateUrl: './genre.component.html',
  styleUrl: './genre.component.css'
})
export class GenreComponent implements OnInit{
  genres: GenreResponse[] = [];
  error: string = '';

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

}

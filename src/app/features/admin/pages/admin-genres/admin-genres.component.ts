import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GenreComponent } from '../../../genre/pages/crud_genre/genre.component';

@Component({
  selector: 'app-admin-genres',
  standalone: true,
  imports: [CommonModule, GenreComponent],
  templateUrl: './admin-genres.component.html',
  styleUrl: './admin-genres.component.css'
})
export class AdminGenresComponent {
  
  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/admin']);
  }
}

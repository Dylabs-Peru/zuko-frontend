import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  searchTerm = '';
  searchType = 'user';

  constructor(private router: Router) {}

  onSearch() {
    if (!this.searchTerm.trim()) return;
    // Navega a una ruta de búsqueda (ajusta según tu app)
    this.router.navigate(['/buscar'], {
      queryParams: { q: this.searchTerm, tipo: this.searchType }
    });
  }
}

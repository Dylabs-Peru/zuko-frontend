import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../services/User.service';
import { UserResponse } from '../../../models/user.model';
import { catchError } from 'rxjs';

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
  errorMsg = '';

  constructor(private router: Router, private userService: UserService) {}

  onSearch() {
    if (!this.searchTerm.trim()) return;
    // Solo busca usuarios por ahora
    this.userService.getUserByUsername(this.searchTerm.trim())
      .pipe(
        catchError(err => {
          this.errorMsg = 'Usuario no encontrado';
          return [];
        })
      )
      .subscribe((user: UserResponse) => {
        if (user && user.username) {
            console.log('Usuario encontrado:', user);
          this.router.navigate(['/user/profile'], { queryParams: { username: user.username } });
        } else {
          this.errorMsg = 'Usuario no encontrado';
        }
      });
  }
}

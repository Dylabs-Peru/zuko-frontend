import { Component, OnInit } from '@angular/core';
import { UserService } from "../../../../services/User.service";
import { UserResponse } from '../../../../models/user.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: UserResponse | null = null;

  constructor(
    private UserService: UserService,
    private router: Router
    ) {}

  ngOnInit(): void {
    // Suponiendo que el AuthResponse se guarda en localStorage tras login
    const auth = localStorage.getItem('auth');
    console.log('Valor de localStorage auth:', auth);
    if (auth) {
      const authObj = JSON.parse(auth);
      this.user = authObj.user;
      console.log('UserResponse:', this.user);
    }
    // Si necesitas refrescar datos del backend, puedes usar userService.getUserById(this.user.id)
  }
}

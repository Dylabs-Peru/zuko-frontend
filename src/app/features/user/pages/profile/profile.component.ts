import { Component, OnInit } from '@angular/core';
import { UserService } from "../../../../services/User.service";
import { UserResponse } from '../../../../models/user.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EditProfileModalComponent } from '../../components/edit-profile-modal/edit-profile-modal.component';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, EditProfileModalComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: UserResponse | null = null;
  isEditModalOpen = false;

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

  openEditModal() {
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
  }

  onSaveEdit(data: { username: string; description: string; url_image: string }) {
    if (!this.user) return;
    this.UserService.updateUser(this.user.id, {
      username: data.username,
      description: data.description,
      url_image: data.url_image
    }).subscribe((updatedUser) => {
      this.user = updatedUser;
      // Actualizar el usuario en localStorage
      const auth = localStorage.getItem('auth');
      if (auth) {
        const authObj = JSON.parse(auth);
        authObj.user = updatedUser;
        localStorage.setItem('auth', JSON.stringify(authObj));
      }
      this.closeEditModal();
    });
  }
}

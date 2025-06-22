import { Component, OnInit } from '@angular/core';
import { UserService } from "../../../../services/User.service";
import { UserResponse } from '../../../../models/user.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EditProfileModalComponent } from '../../components/edit-profile-modal/edit-profile-modal.component';
import { CreateArtistComponent } from '../../../artist/components/create-artist/create-artist.component'; // Añade esta línea
import { ArtistResponse } from '../../../../models/artist.model';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, EditProfileModalComponent, CreateArtistComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: UserResponse | null = null;
  isEditModalOpen = false;
  isArtistModalOpen = false;

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

  openArtistModal() {
    this.isArtistModalOpen = true;
  }

  closeArtistModal() {
    this.isArtistModalOpen = false;
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

  closeEditModal() {
    this.isEditModalOpen = false;
  }

  onArtistCreated(artist: ArtistResponse) {
    if (this.user) {
      this.user.isArtist = true;
    }
    this.closeArtistModal();
    
    // Redirigir al perfil del artista
    this.router.navigate(['/artist', artist.id]);
  }
}


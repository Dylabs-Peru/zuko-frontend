import { Component, OnInit } from '@angular/core';
import { UserService } from "../../../../services/User.service";
import { ArtistService } from '../../../../services/Artist.service';
import { UserResponse } from '../../../../models/user.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EditProfileModalComponent } from '../../components/edit-profile-modal/edit-profile-modal.component';
import { CreateArtistComponent } from '../../../artist/components/create-artist/create-artist.component'; // Añade esta línea
import { ActivateStatusArtistComponent } from '../../../artist/components/activate-status-artist/activate-status-artist.component';
import { ArtistResponse } from '../../../../models/artist.model';
import { AuthService } from '../../../../services/Auth.service';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, EditProfileModalComponent, CreateArtistComponent, ActivateStatusArtistComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: UserResponse | null = null;
  isEditModalOpen = false;
  isArtistModalOpen = false;
  artistInactivo: any = null;

  constructor(
    private UserService: UserService,
    private artistService: ArtistService,
    private router: Router,
    private authService: AuthService
    ) {}

  ngOnInit(): void {
    // Suponiendo que el AuthResponse se guarda en localStorage tras login
    const auth = localStorage.getItem('auth');
    console.log('Valor de localStorage auth:', auth);
    if (auth) {
      const authObj = JSON.parse(auth);
      this.user = authObj.user;
      console.log('UserResponse:', this.user);
      // Buscar artista inactivo si hay user
      if (this.user && this.user.id) {
        // Debes tener ArtistService importado e inyectado
        // @ts-ignore
        if (this.artistService && this.artistService.getAllArtists) {
          this.artistService.getAllArtists().subscribe((artists: any) => {
            console.log('Respuesta de getAllArtists:', artists);
            // Ajusta según la estructura real:
            const arr = Array.isArray(artists) ? artists : (artists.artists || artists.data || []);
            this.artistInactivo = arr.find((a: any) => a.userId === this.user!.id && !a.isActive);
          });
        }
      }
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

    // Espera un ciclo de eventos para asegurar que el modal se cierre antes de navegar
    setTimeout(() => {
      this.logout();
    }, 0);
  }

  logout() {
    this.authService.logout('Logout tras crear artista');
  }
}


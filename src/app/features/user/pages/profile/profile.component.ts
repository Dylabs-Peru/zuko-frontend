import { Component, OnInit } from '@angular/core';
import { UserService } from "../../../../services/User.service";
import { ArtistService } from '../../../../services/Artist.service';
import { UserResponse } from '../../../../models/user.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EditProfileModalComponent } from '../../components/edit-profile-modal/edit-profile-modal.component';
import { CreateArtistComponent } from '../../../artist/components/create-artist/create-artist.component';
import { ActivateStatusArtistComponent } from '../../../artist/components/activate-status-artist/activate-status-artist.component';
import { ArtistResponse } from '../../../../models/artist.model';
import { AuthService } from '../../../../services/Auth.service';
import { signal, computed } from '@angular/core';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, EditProfileModalComponent, CreateArtistComponent, ActivateStatusArtistComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  // Signals para el estado reactivo del perfil
  user = signal<UserResponse | null>(null);
  isEditModalOpen = signal(false);
  isArtistModalOpen = signal(false);
  artistInactivo = signal<any>(null);
  loading = signal(false);

  // Computed signals para datos derivados
  hasUser = computed(() => this.user() !== null);
  canBecomeArtist = computed(() => 
    this.user() && !this.user()?.isArtist
  );
  userDisplayName = computed(() => 
    this.user()?.username || 'Usuario'
  );
  userBio = computed(() => 
    this.user()?.description || 'El usuario no tiene biografía'
  );
  profileImage = computed(() => 
    this.user()?.url_image || 'https://res.cloudinary.com/dqk8inmwe/image/upload/v1750800568/pfp_placeholder_hwwumb.jpg'
  );

  constructor(
    private UserService: UserService,
    private artistService: ArtistService,
    private router: Router,
    private authService: AuthService
    ) {}

  ngOnInit(): void {
    this.loading.set(true);
    // Suponiendo que el AuthResponse se guarda en localStorage tras login
    const auth = localStorage.getItem('auth');
    console.log('Valor de localStorage auth:', auth);
    
    if (auth) {
      const authObj = JSON.parse(auth);
      this.user.set(authObj.user);
      console.log('👤 UserResponse cargado:', this.user());
      
      // Buscar artista inactivo si hay user
      if (this.user() && this.user()!.id) {
        // @ts-ignore
        if (this.artistService && this.artistService.getAllArtists) {
          this.artistService.getAllArtists().subscribe((artists: any) => {
            console.log(' Respuesta de getAllArtists:', artists);
            // Ajusta según la estructura real:
            const arr = Array.isArray(artists) ? artists : (artists.artists || artists.data || []);
            const inactiveArtist = arr.find((a: any) => a.userId === this.user()!.id && !a.isActive);
            this.artistInactivo.set(inactiveArtist || null);
            this.loading.set(false);
            console.log(' Artista inactivo encontrado:', inactiveArtist);
          });
        } else {
          this.loading.set(false);
        }
      } else {
        this.loading.set(false);
      }
    } else {
      this.loading.set(false);
    }
    // Si necesitas refrescar datos del backend, puedes usar userService.getUserById(this.user().id)
  }

  openEditModal() {
    this.isEditModalOpen.set(true);
    console.log(' Abriendo modal de edición de perfil');
  }

  openArtistModal() {
    this.isArtistModalOpen.set(true);
    console.log(' Abriendo modal de crear artista');
  }

  closeArtistModal() {
    this.isArtistModalOpen.set(false);
    console.log(' Cerrando modal de crear artista');
  }

  onSaveEdit(data: { username: string; description: string; url_image: string }) {
    const currentUser = this.user();
    if (!currentUser) return;
    
    this.loading.set(true);
    console.log(' Guardando cambios de perfil:', data);
    
    this.UserService.updateUser(currentUser.id, {
      username: data.username,
      description: data.description,
      url_image: data.url_image
    }).subscribe({
      next: (updatedUser) => {
        this.user.set(updatedUser);
        
        // Actualizar el usuario en localStorage
        const auth = localStorage.getItem('auth');
        if (auth) {
          const authObj = JSON.parse(auth);
          authObj.user = updatedUser;
          localStorage.setItem('auth', JSON.stringify(authObj));
        }
        
        this.closeEditModal();
        this.loading.set(false);
        console.log(' Perfil actualizado exitosamente:', updatedUser);
      },
      error: (error) => {
        console.error(' Error al actualizar perfil:', error);
        this.loading.set(false);
      }
    });
  }

  closeEditModal() {
    this.isEditModalOpen.set(false);
    console.log(' Cerrando modal de edición de perfil');
  }

  onArtistCreated(artist: ArtistResponse) {
    const currentUser = this.user();
    if (currentUser) {
      // Actualizar el usuario para reflejar que ahora es artista
      this.user.update(user => user ? { ...user, isArtist: true } : null);
      console.log('  Usuario actualizado como artista:', artist);
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


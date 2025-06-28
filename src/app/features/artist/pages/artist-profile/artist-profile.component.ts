// En profile-artist.component.ts
import { Component, OnInit } from '@angular/core';
import { ArtistService } from '../../../../services/Artist.service';
import { UserService } from '../../../../services/User.service';
import { ArtistResponse } from '../../../../models/artist.model';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { EditArtistProfileModalComponent } from '../../components/edit-artist-profile-modal/edit-artist-profile-modal.component';
import { EditProfileModalComponent } from '../../../user/components/edit-profile-modal/edit-profile-modal.component';
import { ArtistAlbumsListComponent } from '../../../album/components/artist-albums-list/artist-albums-list.component';
import { CreateAlbumModalComponent } from '../../../album/components/create-album-modal/create-album-modal.component';
import { ArtistSongsComponent } from '../../../song/pages/artist-songs/artist-songs.component';
import { ChangeStatusArtistComponent } from '../../components/change-status-artist/change-status-artist.component';

@Component({
  selector: 'app-profile-artist',
  standalone: true,
  imports: [CommonModule, EditArtistProfileModalComponent, EditProfileModalComponent, ArtistAlbumsListComponent, CreateAlbumModalComponent, ArtistSongsComponent, ChangeStatusArtistComponent],
  templateUrl: './artist-profile.component.html',
  styleUrls: ['./artist-profile.component.css']
})
export class ProfileArtistComponent implements OnInit {
  user: any = null; // <-- Agregado para exponer user al template
  showCreateAlbumModal = false;

  openCreateAlbumModal() {
    this.showCreateAlbumModal = true;
  }
  closeCreateAlbumModal() {
    this.showCreateAlbumModal = false;
  }
  onAlbumCreated(album: any) {
    // Aquí puedes llamar al servicio para crear el álbum
    console.log('Álbum creado:', album);
    this.closeCreateAlbumModal();
  }

  onEditDotsClick() {
    this.showEditModal = true;
  }

  onCreateAlbumClick() {
    this.openCreateAlbumModal();
  }
  showAlbumsSection: boolean = false;
  showSongsSection: boolean = false;
  artist: any = null;
  artistOwnerUser: any = null; // Usuario dueño del artista visitado
  userEmail: string = '';
  isOwnArtistProfile = false;
  showEditModal = false;
  imagePreview: string | null = null;

  // Modal de edición de usuario (foto)
  showEditUserModal = false;


  constructor(
    private artistService: ArtistService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    console.log('ProfileArtistComponent - Constructor');
  }

  ngOnInit() {
    // Carga el usuario desde localStorage para exponerlo al template
    const auth = localStorage.getItem('auth');
    if (auth) {
      try {
        this.user = JSON.parse(auth).user;
      } catch {
        this.user = null;
      }
    }
    console.log('ProfileArtistComponent - ngOnInit');
    this.route.paramMap.subscribe(params => {
      const artistName = params.get('name');
      if (artistName) {
        console.log('Cargando perfil del artista por parámetro de ruta:', artistName);
        this.isOwnArtistProfile = this.checkIfOwnProfile(artistName);
        this.loadArtistByName(artistName);
      } else {
        this.isOwnArtistProfile = true;
        this.loadProfile();
      }
    });
  }

  private checkIfOwnProfile(artistName: string): boolean {
    const auth = localStorage.getItem('auth');
    if (!auth) return false;
    try {
      const authObj = JSON.parse(auth);
      return authObj?.user?.artistName === artistName;
    } catch {
      return false;
    }
  }

  onEditProfile() {
    this.showEditModal = true;
  }

  onSaveArtistProfile(data: any) {
    if (!this.artist) return;
    const updateReq = {
      name: data.name,
      biography: data.biography,
      country: data.country
    };
    // 1. Actualiza datos del artista
    this.artistService.updateArtist(this.artist.id, updateReq).subscribe({
      next: (updated) => {
        this.artist = { ...this.artist, ...updated };
        // 2. Si la imagen cambió, actualiza el usuario dueño
        if (data.url_image && this.artistOwnerUser) {
          if (this.artistOwnerUser.url_image !== data.url_image) {
            this.userService.updateUser(this.artistOwnerUser.id, {
              url_image: data.url_image
            }).subscribe((updatedUser: any) => {
              this.artistOwnerUser = updatedUser;
              // Actualiza localStorage si corresponde
              const auth = localStorage.getItem('auth');
              if (auth) {
                const authObj = JSON.parse(auth);
                if (authObj.user && authObj.user.id === updatedUser.id) {
                  authObj.user = updatedUser;
                  localStorage.setItem('auth', JSON.stringify(authObj));
                }
              }
              // Refleja el cambio en el artista (frontend)
              this.artist = { ...this.artist, urlImage: updatedUser.url_image };
            });
          } else {
            // Si solo se editó la imagen, actualiza el usuario dueño
            this.userService.updateUser(this.artistOwnerUser.id, {
              url_image: data.url_image
            }).subscribe((updatedUser: any) => {
              this.artistOwnerUser = updatedUser;
              // Actualiza localStorage si corresponde
              const auth = localStorage.getItem('auth');
              if (auth) {
                const authObj = JSON.parse(auth);
                if (authObj.user && authObj.user.id === updatedUser.id) {
                  authObj.user = updatedUser;
                  localStorage.setItem('auth', JSON.stringify(authObj));
                }
              }
              // Refleja el cambio en el artista (frontend)
              this.artist = { ...this.artist, urlImage: updatedUser.url_image };
            });
          }
        }
        this.showEditModal = false;
        alert('Perfil de artista actualizado correctamente');
      },
      error: () => {
        alert('Error al actualizar el perfil de artista');
      }
    });
  }

  private loadProfile() {
    console.log('Iniciando loadProfile');
    const auth = localStorage.getItem('auth');
    console.log('Auth data from localStorage:', auth);
    
    if (!auth) {
      console.log('No hay datos de autenticación');
      this.router.navigate(['/login']);
      return;
    }

    try {
      const authObj = JSON.parse(auth);
      console.log('Auth object:', authObj);
      
      const artistName = authObj?.user?.artistName;
      if (artistName) {
        console.log('Cargando perfil del artista por artistName en localStorage:', artistName);
        this.loadArtistByName(artistName);
      } else {
        // Redirige silenciosamente al perfil de usuario, sin mostrar mensaje
        this.router.navigate(['/profile']);
      }
    } catch (e) {
      console.error('Error al parsear auth:', e);
      this.router.navigate(['/login']);
    }
  }

  private loadArtistByName(name: string) {
    console.log('Cargando artista por nombre:', name);
    this.artistService.getArtistByName(name).subscribe({
      next: (response: any) => {
        console.log('Respuesta de la API (artista):', response);
        // Si la respuesta es un array, toma el primer elemento
        const artistData = Array.isArray(response) ? response[0] : (response.data || response);
        this.artist = {
          ...artistData,
          albums: artistData.albums || response.albums || [],
          songs: artistData.songs || response.songs || []
        };
        if (this.artist?.userId) {
          this.loadUserEmail(this.artist.userId);
          this.loadArtistOwnerUser(this.artist.userId); // Nuevo: obtener usuario dueño
        } else {
          this.artistOwnerUser = null;
        }
      },
      error: (error) => {
        console.error('Error al cargar el artista:', error);
        this.router.navigate(['/profile']);
      }
    });
  }

  // Nuevo: obtener el usuario dueño del artista
  private loadArtistOwnerUser(userId: number) {
    this.userService.getUserById(userId).subscribe({
      next: (user: any) => {
        this.artistOwnerUser = user;
      },
      error: () => {
        this.artistOwnerUser = null;
      }
    });
  }

  // Abrir modal de edición de usuario (foto)
  openEditUserModal() {
    this.showEditUserModal = true;
  }
  closeEditUserModal() {
    this.showEditUserModal = false;
  }
  onSaveEditUser(data: { username: string; description: string; url_image: string }) {
    if (!this.artistOwnerUser) return;
    this.userService.updateUser(this.artistOwnerUser.id, {
      username: data.username,
      description: data.description,
      url_image: data.url_image
    }).subscribe((updatedUser) => {
      this.artistOwnerUser = updatedUser;
      // Actualizar el usuario en localStorage si es el propio
      const auth = localStorage.getItem('auth');
      if (auth) {
        const authObj = JSON.parse(auth);
        if (authObj.user && authObj.user.id === updatedUser.id) {
          authObj.user = updatedUser;
          localStorage.setItem('auth', JSON.stringify(authObj));
        }
      }
      this.closeEditUserModal();
    });
  }

  private loadUserEmail(userId: number) {
    console.log('Cargando email del usuario ID:', userId);
    this.userService.getUserById(userId).subscribe({
      next: (user: any) => {
        console.log('Email del usuario cargado:', user?.email);
        this.userEmail = user?.email || 'Artista registrado';
      },
      error: (error) => {
        console.error('Error al cargar el email:', error);
        this.userEmail = 'Artista registrado';
      }
    });
  }
}
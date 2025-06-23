// En profile-artist.component.ts
import { Component, OnInit } from '@angular/core';
import { ArtistService } from '../../../../services/Artist.service';
import { UserService } from '../../../../services/User.service';
import { ArtistResponse } from '../../../../models/artist.model';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { EditArtistProfileModalComponent } from '../../components/edit-artist-profile-modal/edit-artist-profile-modal.component';
import { ArtistAlbumsListComponent } from '../../../album/components/artist-albums-list/artist-albums-list.component';
import { CreateAlbumModalComponent } from '../../../album/components/create-album-modal/create-album-modal.component';
import { ArtistSongsComponent } from '../../../song/pages/artist-songs/artist-songs.component';

@Component({
  selector: 'app-profile-artist',
  standalone: true,
  imports: [CommonModule, EditArtistProfileModalComponent, ArtistAlbumsListComponent, CreateAlbumModalComponent, ArtistSongsComponent],
  templateUrl: './artist-profile.component.html',
  styleUrls: ['./artist-profile.component.css']
})
export class ProfileArtistComponent implements OnInit {
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
  userEmail: string = '';
  isOwnArtistProfile = false;
  showEditModal = false;
  imagePreview: string | null = null;

  constructor(
    private artistService: ArtistService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    console.log('ProfileArtistComponent - Constructor');
  }

  ngOnInit() {
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
      urlImage: data.urlImage,
      country: data.country
    };
    this.artistService.updateArtist(this.artist.id, updateReq).subscribe({
      next: (updated) => {
        this.artist = { ...this.artist, ...updated };
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
        }
      },
      error: (error) => {
        console.error('Error al cargar el artista:', error);
        this.router.navigate(['/profile']);
      }
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
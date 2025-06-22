// En profile-artist.component.ts
import { Component, OnInit } from '@angular/core';
import { ArtistService } from '../../../../services/Artist.service';
import { UserService } from '../../../../services/User.service';
import { ArtistResponse } from '../../../../models/artist.model';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-profile-artist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-artist.component.html',
  styleUrls: ['./profile-artist.component.css']
})
export class ProfileArtistComponent implements OnInit {
  artist: any = null;
  userEmail: string = '';

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
    this.route.params.subscribe(params => {
      console.log('Route params:', params);
      this.loadProfile();
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
      
      if (!authObj?.user?.id) {
        console.log('No se encontró el ID de usuario en auth');
        this.router.navigate(['/login']);
        return;
      }

      console.log('Obteniendo datos del usuario ID:', authObj.user.id);
      this.userService.getUserById(authObj.user.id).subscribe({
        next: (user: any) => {
          console.log('Datos del usuario:', user);
          
          if (user.artistName) {
            console.log('Cargando perfil del artista:', user.artistName);
            this.loadArtistByName(user.artistName);
          } else {
            console.log('El usuario no tiene perfil de artista');
            this.router.navigate(['/profile']);
          }
        },
        error: (error) => {
          console.error('Error al cargar el usuario:', error);
          this.router.navigate(['/login']);
        }
      });
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
        this.artist = {
          ...response.data || response,
          albums: response.albums || [],
          songs: response.songs || []
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
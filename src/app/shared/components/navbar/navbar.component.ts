import { PlaylistDisplayComponent } from './../../../features/playlist/pages/playlist-display/playlist-display.component';
import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../services/User.service';
import { UserResponse } from '../../../models/user.model';
import { SongService } from '../../../services/Song.service';
import { SongResponse } from '../../../models/song.model';
import { catchError, forkJoin, of } from 'rxjs';
import { ArtistResponse } from '../../../models/artist.model';
import { ArtistService } from '../../../services/Artist.service';
import { AuthService } from '../../../services/Auth.service';
import { AlbumService } from '../../../services/Album.service';
import { environment } from '../../../../environments/environment';
import { filter } from 'rxjs/operators';
import { PlaylistResponse } from '../../../models/playlist.model';
import { PlaylistService } from '../../../services/playlist.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  searchTerm = '';
  errorMsg = '';
  userResults: UserResponse[] = [];
  songResults: SongResponse[] = [];
  artistResults: ArtistResponse[] = [];
  albumResults: any[] = [];
  playlistResults: PlaylistResponse[] = [];
  showResults = false;
  public isLandingPage = false;
  constructor(
    private router: Router,
    private userService: UserService,
    private songService: SongService,
    private artistService: ArtistService,
    private albumService: AlbumService,
    private playlistService: PlaylistService,
    private authService: AuthService
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isLandingPage = event.urlAfterRedirects === '/';
      });

   }
  get isArtist(): boolean {
    const auth = this.authService.getAuthInfo();
    if (!auth) return false;
    
    try {
      // Verifica si el usuario tiene artistName en su perfil
      return !!auth?.user?.artistName;
    } catch (e) {
      console.error('Error al verificar perfil de artista:', e);
      return false;
    }
  }

  
  get isAdmin(): boolean {
    const auth = this.authService.getAuthInfo();
    if (!auth) return false;
    
    try {
      // Verifica si el usuario tiene rol de admin
      return auth?.user?.roleName?.toLowerCase() === 'admin';
    } catch (e) {
      console.error('Error al verificar rol de admin:', e);
      return false;
    }
  }

  get currentUser(): any {
    const auth = this.authService.getAuthInfo();
    return auth?.user || null;
  }

  get userProfileImage(): string {
    const user = this.currentUser;
    return user?.url_image || environment.defaultProfileImage;
  }

  /**
   * Maneja errores de carga de imagen y establece el placeholder
   */
  onImageError(event: any): void {
    event.target.src = environment.defaultProfileImage;
  }

  get username(): string {
    const user = this.currentUser;
    return user?.username || 'Usuario';
  }

  onSearch() {
    if (!this.searchTerm.trim()) return;
    this.errorMsg = '';
    this.showResults = false;
    this.userResults = [];
    this.songResults = [];
    this.artistResults = [];
    this.albumResults = [];
    this.playlistResults = [];

    forkJoin({
      users: this.userService.searchUsersByUsername(this.searchTerm.trim()).pipe(catchError(() => of([]))),
      songs: this.songService.searchPublicSongsByTitle(this.searchTerm.trim()).pipe(catchError(() => of([]))),
      artist: this.artistService.getArtistByName(this.searchTerm.trim()).pipe(catchError(() => of([]))),
      albums: this.albumService.getAlbumsByTitle(this.searchTerm.trim()).pipe(catchError(() => of([]))),
      playlists: this.playlistService.getPublicPlaylistsByName(this.searchTerm.trim()).pipe(catchError(() => of([])))
    }).subscribe(({ users, songs, artist, albums, playlists }) => {
      console.log("Users:", users);
      console.log("Playlists:", playlists);

      // Ahora users es un array, no un solo usuario
      if (users && Array.isArray(users) && users.length > 0) {
        // Filtrar usuarios case-insensitive y excluir el usuario actual
        const currentUser = this.currentUser;
        this.userResults = users.filter(user => {
          // Filtro 1: Case-insensitive
          const matchesSearch = user.username.toLowerCase().includes(this.searchTerm.trim().toLowerCase());
          // Filtro 2: No incluir el usuario actual
          const isNotCurrentUser = !currentUser || user.username !== currentUser.username;
          
          return matchesSearch && isNotCurrentUser;
        });
      } else {
        this.userResults = [];
      }
      if (artist && Array.isArray(artist) && artist.length > 0) {
        this.artistResults = artist;
      } else {
        this.artistResults = [];
      }
      if (songs && Array.isArray(songs)) {
        this.songResults = songs.filter(song => song.title.toLowerCase().includes(this.searchTerm.trim().toLowerCase()));
      }
      if (albums && Array.isArray(albums.data)) {
        this.albumResults = albums.data;
      } else {
        this.albumResults = [];
      }
       if (playlists && Array.isArray(playlists)) {
        this.playlistResults = playlists
      }
      
      // Verificar si no hay resultados en ninguna categoría
      if ((!this.userResults || this.userResults.length === 0) && 
          (!this.songResults || this.songResults.length === 0) && 
          (!this.artistResults || this.artistResults.length === 0) && 
          (!this.albumResults || this.albumResults.length === 0) && 
          (!this.playlistResults || this.playlistResults.length === 0)) {
        this.errorMsg = 'No se encontraron resultados';
      }

      
      this.showResults = true;
    });
  }

  goToUser(username: string) {
    const auth = localStorage.getItem('auth');
    let loggedUser = null;
    if (auth) {
      try {
        const authObj = JSON.parse(auth);
        loggedUser = authObj.UserResponse || authObj.user;
      } catch (e) {
        loggedUser = null;
      }
    }
    if (loggedUser && loggedUser.username === username) {
      this.router.navigate(['/user/Myprofile']);
    } else {
      this.router.navigate(['/user/profile', username]);
    }
    this.showResults = false;
  }

  goToSong(songId: number) {
  this.router.navigate(['/songs/detail', songId]);
  this.showResults = false;
  this.searchTerm = '';
}

  goToArtist(artistName: string) {
    this.router.navigate(['/artist/profile-artist', artistName]);
    this.showResults = false;
  }

  goToAlbum(albumId: number) {
    this.router.navigate(['/album', albumId]);
    this.showResults = false;
  }

  goToUserProfile(username: string) {
    const auth = this.authService.getAuthInfo();
    if (auth && auth.user && auth.user.username === username) {
      this.router.navigate(['/user/Myprofile']);
    } else {
      this.router.navigate(['/user/profile', username]);
    }
  }

  logout() {
    this.authService.logout('Usuario realizó logout manual');
  }

  goToLibrary() {
    this.router.navigate(['/playlist/library']);
    this.showResults = false;
  }

  goToAdminDashboard() {
    this.router.navigate(['/admin']);
    this.showResults = false;
  }

  goToPlaylist(playlistId: number) {
    this.router.navigate(['/playlist', playlistId]);
    this.showResults = false;
    this.searchTerm = ''
  }
}

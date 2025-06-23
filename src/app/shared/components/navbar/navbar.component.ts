import { Component } from '@angular/core';
import { Router } from '@angular/router';
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
  showResults = false;
  constructor(
    private router: Router,
    private userService: UserService,
    private songService: SongService,
    private artistService: ArtistService,
    private authService: AuthService
  ) { }
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

  onSearch() {
    if (!this.searchTerm.trim()) return;
    this.errorMsg = '';
    this.showResults = false;
    this.userResults = [];
    this.songResults = [];
    this.artistResults = [];

    forkJoin({
      user: this.userService.getUserByUsername(this.searchTerm.trim()).pipe(catchError(() => of(null))),
      songs: this.songService.getMySongs().pipe(catchError(() => of([]))),
      artist: this.artistService.getArtistByName(this.searchTerm.trim()).pipe(catchError(() => of([])))
    
    }).subscribe(({ user, songs, artist }) => {
      if (user) this.userResults = [user];
      if (artist && Array.isArray(artist) && artist.length > 0) {
        this.artistResults = artist;
      } else {
        this.artistResults = [];
      }
      if (songs && Array.isArray(songs)) {
        this.songResults = songs.filter(song => song.title.toLowerCase().includes(this.searchTerm.trim().toLowerCase()));
      }
      if (!user && (!this.songResults || this.songResults.length === 0) && (!this.artistResults || this.artistResults.length === 0)) {
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
    this.router.navigate(['/songs', songId]);
    this.showResults = false;
  }

  goToArtist(artistName: string) {
    this.router.navigate(['/artist/profile-artist', artistName]);
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
}

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
// import { ArtistService } from '../../../services/Artist.service';

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
  // artistResults: any[] = [];
  showResults = false;

  constructor(
    private router: Router,
    private userService: UserService,
    private songService: SongService,
    // private artistService: ArtistService // futuro
  ) {}

  onSearch() {
    if (!this.searchTerm.trim()) return;
    this.errorMsg = '';
    this.showResults = false;
    this.userResults = [];
    this.songResults = [];

    // this.artistResults = [];

    forkJoin({
      user: this.userService.getUserByUsername(this.searchTerm.trim()).pipe(catchError(() => of(null))),
      songs: this.songService.getMySongs().pipe(catchError(() => of([])))
      // artist: of([]) // Aquí iría la búsqueda de artista
    }).subscribe(({ user, songs }) => {
      if (user) this.userResults = [user];
      if (songs && Array.isArray(songs)) {
        this.songResults = songs.filter(song => song.title.toLowerCase().includes(this.searchTerm.trim().toLowerCase()));
      }
      if (!user && (!this.songResults || this.songResults.length === 0)) {
        this.errorMsg = 'No se encontraron resultados';
      }
      this.showResults = true;
    });
  }

  goToUser(username: string) {
    this.router.navigate(['/user/profile', username]);
    this.showResults = false;
  }

  goToSong(songId: number) {
    this.router.navigate(['/songs', songId]);
    this.showResults = false;
  }
}

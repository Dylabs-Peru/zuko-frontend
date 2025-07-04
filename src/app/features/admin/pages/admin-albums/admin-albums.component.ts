import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ArtistService } from '../../../../services/Artist.service';
import { UserService } from '../../../../services/User.service';
import { ArtistResponse } from '../../../../models/artist.model';
import { UserResponse } from '../../../../models/user.model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-admin-albums',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-albums.component.html',
  styleUrls: ['./admin-albums.component.css']
})
export class AdminAlbumsComponent implements OnInit {
  onImageError(event: Event, artistName: string): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(artistName);
    }
  }

  getProfileImageUrl(url?: string | null): string {
    if (!url || url.trim() === '') {
      return environment.defaultProfileImage;
    }
    return url;
  }
  artists: ArtistResponse[] = [];
  loading = false;

  constructor(private router: Router, private artistService: ArtistService, private userService: UserService) {}

  ngOnInit(): void {
    this.loading = true;
    forkJoin({
      artists: this.artistService.getAllArtists(),
      users: this.userService.getAllUsers()
    }).subscribe({
      next: ({ artists, users }) => {
        // Vincular usuario a cada artista por userId
        this.artists = artists.map(artist => {
          const user = users.find(u => u.id === artist.userId);
          return { ...artist, user };
        });
        this.loading = false;
      },
      error: () => {
        this.artists = [];
        this.loading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin']);
  }
}


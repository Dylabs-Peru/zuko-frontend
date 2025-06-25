import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaylistResponse } from '../../models/playlist.model';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-home-page',
  imports: [CommonModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent implements OnInit {
  shortcuts: PlaylistResponse[] = [];
  userId: number | null = null;
  constructor(private router: Router) {}


  ngOnInit() {
    const auth = localStorage.getItem('auth');
    if (auth) {
      const authObj = JSON.parse(auth);
      this.userId = authObj.user?.id || null;
      const key = `shortcuts_${this.userId}`;
      this.shortcuts = JSON.parse(localStorage.getItem(key) || '[]');
    }
  }

  goToPlaylist(playlistId: number) {
     this.router.navigate(['/playlist', playlistId]);
  }

}

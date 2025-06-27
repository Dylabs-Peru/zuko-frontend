import { ShortcutsService } from './../../services/shortcuts.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ShortcutsResponse } from '../../models/shortcuts.model';
import { PlaylistSummaryResponse } from './../../models/playlist.model';
import { AlbumResponse } from '../../models/album.model';

@Component({
  standalone: true,
  selector: 'app-home-page',
  imports: [CommonModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent implements OnInit {
  shortcuts: ShortcutsResponse[] = [];
  playlists: PlaylistSummaryResponse[] = [];
  albums : AlbumResponse[] = []; // actualizar  
  userId: number | null = null;
  shortcutsId: number | null = null;
  error = '';
  isLoading = false;
  constructor(private router: Router,
              private shortcutsService: ShortcutsService
  ){}

  ngOnInit(): void {
    this.loadShortcuts();
  }

  loadShortcuts(): void {
    this.isLoading = true;
    this.error = '';
    this.shortcutsService.getShortcutsByUser().subscribe({
      next: (shortcuts) => {
        this.shortcutsId = shortcuts.ShortcutsId;
        this.playlists = shortcuts.Playlists;
        this.albums = shortcuts.Albums;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los accesos directos';
        this.isLoading = false;
        console.error(err);
      }
    });
  }
  
  

  goToPlaylist(playlistId: number) {
     this.router.navigate(['/playlist', playlistId]);
  }

}

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { PlaylistService } from '../../../../services/playlist.service';
import {PlaylistResponse} from '../../../../models/playlist.model';
import { NgIf, NgFor, NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-playlist-library',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, NgStyle],
  templateUrl: './biblioteca.component.html',
  styleUrl: './biblioteca.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaylistLibraryComponent implements OnInit {
  playlists: PlaylistResponse[] = [];
  filteredPlaylists: PlaylistResponse[] = [];
  isLoading = false;
  error = '';
  searchQuery = '';

  constructor(private playlistService: PlaylistService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadPlaylists();
  }

  loadPlaylists(): void {
    this.isLoading = true;
    this.error = '';
    this.playlistService.getMyPlaylists().subscribe({
      next: (playlists) => {
        this.playlists = playlists;
        this.applyFilter();
        this.isLoading = false;
        this.cdr.markForCheck(); 
      },
      error: (err) => {
        this.error = 'Error al cargar tus playlists';
        this.isLoading = false;
        console.error(err);
        this.cdr.markForCheck();
      }
    });
  }

onSearch(): void {
  const q = this.searchQuery.trim().toLowerCase();
  if (!q) {
    this.filteredPlaylists = this.playlists;
  } else {
    this.filteredPlaylists = this.playlists.filter(p =>
      p.name.toLowerCase().includes(q)
    );
  }
  this.cdr.markForCheck(); 
}

  applyFilter(): void {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) {
      this.filteredPlaylists = this.playlists;
    } else {
      this.filteredPlaylists = this.playlists.filter(p =>
        p.name.toLowerCase().includes(q)
      );
    }
  }
}

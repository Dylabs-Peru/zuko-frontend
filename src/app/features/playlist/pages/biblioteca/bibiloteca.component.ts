import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { PlaylistService } from '../../../../services/playlist.service';
import {PlaylistResponse} from '../../../../models/playlist.model';
import { NgIf, NgFor, NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreatePlaylistDialogComponent } from '../../components/crear-playlist/crear-playlist.component';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Subject } from 'rxjs';
@Component({
  selector: 'app-playlist-library',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, NgStyle, CreatePlaylistDialogComponent],
  templateUrl: './biblioteca.component.html',
  styleUrl: './biblioteca.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaylistLibraryComponent implements OnInit {
  playlists: PlaylistResponse[] = [];
  isLoading = false;
  error = '';
  searchQuery = '';
  showCreateDialog = false;
  searchQueryChanged = new Subject<string>(); 
  isSearching = false;

  constructor(private playlistService: PlaylistService, 
              private cdr: ChangeDetectorRef,
              private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPlaylists();
    this.searchQueryChanged.pipe(
      debounceTime(350),           // Espera 350 ms tras dejar de tipear
      distinctUntilChanged()       // Solo emite si cambió el texto
    ).subscribe(q => {
      this.onSearchReal(q);
    });
  }

  loadPlaylists(): void {
    this.isLoading = true;
    this.error = '';
    this.playlistService.getMyPlaylists().subscribe({
      next: (playlists) => {
        this.playlists = playlists;
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
    this.searchQueryChanged.next(this.searchQuery);
  }

  onSearchReal(query: string): void {
    this.isSearching = query.trim() !== '';
    this.isLoading = true;
    this.error = '';

    if (query.trim() === '') {
      this.loadPlaylists();
      return;
    } 
      this.playlistService.searchMyPlaylistsByName(query).subscribe({
        next: (playlists) => {
          this.playlists = playlists;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.error = 'Error en la búsqueda de playlists';
          this.isLoading = false;
          this.cdr.markForCheck();
        }
    });
  }
  

  onOpenCreateDialog() {
  this.showCreateDialog = true;
  }

  onCloseCreateDialog() {
    this.showCreateDialog = false;
  }

  onPlaylistCreated(newPlaylist: PlaylistResponse) {
    this.playlists = [newPlaylist, ...this.playlists];
    this.showCreateDialog = false;
  }
  goToPlaylist(playlistId: number | string): void  {
    console.log('Navegando a', playlistId);
    this.router.navigate(['/playlist', playlistId]);
  }
}

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { PlaylistService } from '../../../../services/playlist.service'; 
import { PlaylistResponse } from '../../../../models/playlist.model';
import { NgIf,NgFor } from '@angular/common';

@Component({
  selector: 'app-add-song-to-playlist-modal',
  templateUrl: './add-song-to-playlist.component.html',
  styleUrls: ['./add-song-to-playlist.component.css'],
  imports: [NgIf, NgFor]
})
export class AddSongToPlaylistModalComponent implements OnInit {
  @Input() songId!: number;
  @Output() close = new EventEmitter<void>();
  @Output() songAdded = new EventEmitter<void>();
  
  playlists: PlaylistResponse[] = [];
  selectedPlaylistIds: Set<number> = new Set();
  loading = false;
  error = '';

  constructor(private playlistService: PlaylistService) {}

  ngOnInit() {
    this.loading = true;
    this.playlistService.getMyPlaylists().subscribe({
      next: (playlists) => {
        this.playlists = playlists;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar playlists';
        this.loading = false;
      }
    });
  }

  togglePlaylist(playlistId: number) {
    if (this.selectedPlaylistIds.has(playlistId)) {
      this.selectedPlaylistIds.delete(playlistId);
    } else {
      this.selectedPlaylistIds.add(playlistId);
    }
  }

  confirmAdd() {
    this.loading = true;
    const requests = Array.from(this.selectedPlaylistIds).map(pid =>
      this.playlistService.addSongToPlaylist(pid, this.songId)
    );
    
    Promise.all(requests.map(req => req.toPromise()))
      .then(() => {
        this.loading = false;
        this.songAdded.emit();
        this.close.emit();
      })
      .catch(() => {
        this.error = 'Error al agregar la canción a las playlists';
        this.loading = false;
      });
  }
}

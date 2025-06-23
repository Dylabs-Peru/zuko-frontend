import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SongResponse } from '../../../../models/song.model';
import { PlaylistService } from '../../../../services/playlist.service';
import { NgFor } from '@angular/common';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-playlist-songs-edit-list',
  standalone: true,
  templateUrl: './playlist-songs-edit-list.component.html',
  styleUrls: ['./playlist-songs-edit-list.component.css'],
  imports: [NgFor, DatePipe],
})
export class PlaylistSongsEditListComponent {
  @Input() songs: SongResponse[] = [];
  @Input() playlistId!: number;
  @Output() songRemoved = new EventEmitter<number>();
  @Output() close = new EventEmitter<void>();

  loadingIds: number[] = [];

  constructor(private playlistService: PlaylistService) {}

  removeSong(songId: number) {
    if (this.loadingIds.includes(songId)) return;
    this.loadingIds.push(songId);
    this.playlistService.removeSongFromPlaylist(this.playlistId, songId).subscribe({
      next: () => {
        this.songRemoved.emit(songId);
        // Puedes filtrar la lista local aquí si quieres UX más responsiva:
        this.songs = this.songs.filter(song => song.id !== songId);
        this.loadingIds = this.loadingIds.filter(id => id !== songId);
      },
      error: () => {
        alert('No se pudo eliminar la canción.');
        this.loadingIds = this.loadingIds.filter(id => id !== songId);
      }
    });
  }
}

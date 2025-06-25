import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { SongResponse } from '../../../../models/song.model';
import { PlaylistService } from '../../../../services/playlist.service';
import { NgFor, NgIf } from '@angular/common';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlaylistResponse,UpdatePlaylistRequest } from '../../../../models/playlist.model';

@Component({
  selector: 'app-playlist-songs-edit-list',
  standalone: true,
  templateUrl: './playlist-songs-edit-list.component.html',
  styleUrls: ['./playlist-songs-edit-list.component.css'],
  imports: [NgFor, DatePipe, NgIf, DatePipe, FormsModule],
})
export class PlaylistSongsEditListComponent {
  @Input() playlist: PlaylistResponse | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() playlistEdited = new EventEmitter<PlaylistResponse>();
  tab: 'info' | 'songs' = 'info';
  editName: string = '';
  editDescription: string = '';
  editIsPublic: boolean = true;
  coverUrl: string = '';
  coverFile: File | null = null;

  @Input() songs: SongResponse[] = [];
  @Input() playlistId!: number;
  @Output() songRemoved = new EventEmitter<number>();
  loadingIds: number[] = [];

  saving = false;
  error = ''
  

  constructor(private playlistService: PlaylistService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['playlist'] && this.playlist) {
      this.editName = this.playlist.name || '';
      this.editDescription = this.playlist.description || '';
      this.editIsPublic = this.playlist.isPublic || true;
      this.coverUrl = this.playlist.url_image || '';
      this.coverFile = null; 
    }
  }

  onCoverSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.coverFile = file;
      // Preview local mientras sube
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.coverUrl = e.target.result;
      };
      reader.readAsDataURL(file);

      // Subir a Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'zuko_pfps');
      fetch('https://api.cloudinary.com/v1_1/dqk8inmwe/image/upload', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.secure_url) {
          this.coverUrl = data.secure_url;
        } else {
          alert('Error al subir la imagen');
        }
      })
      .catch(() => {
        alert('Error al subir la imagen');
      });
    }
  }

  onSave() {
    if (!this.editName.trim()) {
      this.error = 'El nombre de la playlist no puede estar vacío';
      return;
    }
    this.saving = true;
    this.error = '';
    const req: UpdatePlaylistRequest = {
      name: this.editName.trim(),
      description: this.editDescription?.trim() || '',
      isPublic: this.editIsPublic,
      url_image: this.coverUrl
    };
    this.playlistService.updatePlaylist(this.playlistId, req).subscribe({
      next: (res) => {
        this.saving = false;
        this.playlistEdited.emit(res);
        this.close.emit();
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.detail || 'Error al editar la playlist';
      }
    });
  }

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

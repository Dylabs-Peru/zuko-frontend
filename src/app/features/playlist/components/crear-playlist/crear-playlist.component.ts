import { PlaylistService } from './../../../../services/playlist.service';
import { Component, EventEmitter, Output, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PlaylistRequest, PlaylistResponse } from '../../../../models/playlist.model';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-create-playlist-dialog',
  standalone: true,
  templateUrl: './crear-playlist.component.html',
  styleUrls: ['./crear-playlist.component.css'],
  imports: [NgIf, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreatePlaylistDialogComponent {
  @Output() created = new EventEmitter<PlaylistResponse>();
  @Output() closed = new EventEmitter<void>();

  playlistName = '';
  playlistDescription = '';
  isPublic = true;
  coverUrl: string = '';
  coverFile: File | null = null;
  uploading = false;
  error = '';
  loading = false;

  constructor(
    private playlistService: PlaylistService,
  ) {}

  onFileSelected(event: any) {
   const file = event.target.files[0];
    if (file) {
        this.coverFile = file;
        this.coverUrl = '';
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'zuko_pfps'); 

        const reader = new FileReader();
        reader.onload = (e: any) => {
        this.coverUrl = e.target.result;
        };
        reader.readAsDataURL(file);

        this.uploading = true;
        fetch('https://api.cloudinary.com/v1_1/dqk8inmwe/image/upload', {
        method: 'POST',
        body: formData
        })
        .then(response => response.json())
        .then(data => {
            this.uploading = false;
            if (data.secure_url) {
            this.coverUrl = data.secure_url; 
            } else {
            alert('Error al subir la imagen');
            }
        })
        .catch(() => {
            this.uploading = false;
            alert('Error al subir la imagen');
        });
        }
    }
  async onCreatePlaylist() {
    if (!this.playlistName.trim()) {
      this.error = 'El nombre de la playlist es obligatorio';
      return;
    }
    this.loading = true;
    this.error = '';

    const request: PlaylistRequest = {
      name: this.playlistName.trim(),
      description: this.playlistDescription.trim(),
      isPublic: this.isPublic,
      url_image: this.coverUrl || undefined
    };

    this.playlistService.createPlaylist(request).subscribe({
      next: (response) => {
        this.created.emit(response);
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Error al crear la playlist';
        this.loading = false;
      }
    });
  }

  onClose() {
    this.closed.emit();
  }
}

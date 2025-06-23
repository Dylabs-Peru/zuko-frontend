import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlbumService } from '../../../../services/Album.service';

@Component({
  selector: 'app-delete-album-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-album-modal.component.html',
  styleUrls: ['./delete-album-modal.component.css']
})
export class DeleteAlbumModalComponent {
  @Input() show = false;
  @Input() albumTitle: string = '';
  @Input() albumId: number|null = null;
  @Output() close = new EventEmitter<void>();
  @Output() albumDeleted = new EventEmitter<void>();
  isDeleting = false;

  constructor(private albumService: AlbumService) {}

  onDelete() {
    if (!this.albumId) return;
    this.isDeleting = true;
    this.albumService.deleteAlbum(this.albumId).subscribe({
      next: () => {
        this.isDeleting = false;
        this.albumDeleted.emit();
        this.close.emit();
      },
      error: () => {
        this.isDeleting = false;
        alert('Error al eliminar el álbum');
      }
    });
  }

  onClose() {
    this.close.emit();
  }
}

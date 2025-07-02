import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlbumService } from '../../../../services/Album.service';
import { ShortcutsService } from '../../../../services/shortcuts.service';
import { firstValueFrom } from 'rxjs';

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

  constructor(
    private albumService: AlbumService,
    private shortcutsService: ShortcutsService
  ) {}

  async onDelete() {
    if (!this.albumId) return;
    
    this.isDeleting = true;
    
    try {
      // Primero intentamos eliminar el álbum de accesos directos si está ahí
      try {
        await firstValueFrom(this.shortcutsService.removeAlbumFromShortcuts(this.albumId));
      } catch (error) {
        // Si falla porque no existe en accesos directos, continuamos igual
        console.log('El álbum no estaba en accesos directos o ya fue eliminado');
      }
      
      // Luego eliminamos el álbum
      this.albumService.deleteAlbum(this.albumId).subscribe({
        next: () => {
          this.isDeleting = false;
          this.albumDeleted.emit();
          this.close.emit();
        },
        error: (error) => {
          console.error('Error al eliminar el álbum:', error);
          this.isDeleting = false;
          alert('Error al eliminar el álbum');
        }
      });
    } catch (error) {
      console.error('Error al procesar la eliminación:', error);
      this.isDeleting = false;
      alert('Error al procesar la eliminación del álbum');
    }
  }

  onClose() {
    this.close.emit();
  }
}

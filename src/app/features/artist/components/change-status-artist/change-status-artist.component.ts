import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArtistService } from '../../../../services/Artist.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-status-artist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './change-status-artist.component.html',
  styleUrls: ['./change-status-artist.component.css']
})
export class ChangeStatusArtistComponent {
  @Input() artistId!: number;
  @Input() isActive: boolean = true;
  @Output() statusChanged = new EventEmitter<boolean>();

  showConfirmModal = false;
  loading = false;

  constructor(private artistService: ArtistService, private router: Router) {}

  openConfirmModal() {
    this.showConfirmModal = true;
  }

  closeConfirmModal() {
    this.showConfirmModal = false;
  }

  onConfirmDeactivate() {
    this.loading = true;
    this.artistService.toggleArtistActiveStatus(this.artistId).subscribe({
      next: (res) => {
        // Si el backend responde OK, aunque sea vacío, borra y redirige
        this.finalizeDeactivation();
      },
      error: (err) => {
        // Si el error es de parseo pero el status es 200/204, también trata como éxito
        if (
          err.status === 200 ||
          err.status === 204 ||
          (err.message && err.message.includes('parsing'))
        ) {
          this.finalizeDeactivation();
        } else {
          console.error('Error al cambiar el estado de artista:', err);
          alert('Error al cambiar el estado de artista: ' + (err.error?.message || err.message || err));
          this.loading = false;
          this.closeConfirmModal();
        }
      }
    });
  }

  finalizeDeactivation() {
    const auth = localStorage.getItem('auth');
    if (auth) {
      const authObj = JSON.parse(auth);
      if (authObj.user && authObj.user.artistName) {
        delete authObj.user.artistName;
        localStorage.setItem('auth', JSON.stringify(authObj));
      }
    }
    alert('Has dejado de ser artista. Ahora eres un usuario normal.');
    this.statusChanged.emit(false);
    this.loading = false;
    this.closeConfirmModal();
    this.router.navigate(['/user/Myprofile']);
  }

}

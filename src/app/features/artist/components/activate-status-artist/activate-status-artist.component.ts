import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ArtistService } from '../../../../services/Artist.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-activate-status-artist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activate-status-artist.component.html',
  styleUrls: ['./activate-status-artist.component.css']
})
export class ActivateStatusArtistComponent {
  @Input() artistId!: number;
  artistName: string | undefined;
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

  onConfirmActivate() {
    this.loading = true;
    // Primero busca el nombre del artista antes de activar
    this.artistService.getAllArtists().subscribe((artistsResponse: any) => {
      const arr = Array.isArray(artistsResponse) ? artistsResponse : (artistsResponse.data || artistsResponse.artists || []);
      const myArtist = arr.find((a: any) => a.id === this.artistId);
      this.artistName = myArtist?.name;
      this.artistService.toggleArtistActiveStatus(this.artistId).subscribe({
        next: () => {
          this.finalizeActivation();
        },
        error: (err) => {
          // Si es error de parseo vacío, igual lo tratamos como éxito
          if (
            err.status === 200 ||
            err.status === 204 ||
            (err.message && err.message.includes('parsing'))
          ) {
            this.finalizeActivation();
          } else {
            console.error('Error al reactivar el estado de artista:', err);
            alert('Error al reactivar el estado de artista: ' + (err.error?.message || err.message || err));
            this.loading = false;
            this.closeConfirmModal();
          }
        }
      });
    });
  }

  finalizeActivation() {
    const auth = localStorage.getItem('auth');
    if (auth) {
      const authObj = JSON.parse(auth);
      if (authObj.user && this.artistName) {
        authObj.user.artistName = this.artistName;
        localStorage.setItem('auth', JSON.stringify(authObj));
      }
    }
    alert('¡Has reactivado tu perfil de artista! Ahora puedes acceder a tus funciones de artista.');
    this.statusChanged.emit(true);
    this.loading = false;
    this.closeConfirmModal();
    // Redirigir al perfil de artista tras reactivar
    if (this.artistName) {
      this.router.navigate(['/artist/profile-artist', this.artistName]);
    } else {
      this.router.navigate(['/artist/profile-artist']);
    }
  }
  }
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ArtistService } from '../../../../services/Artist.service';
import { ArtistResponse } from '../../../../models/artist.model';

@Component({
  selector: 'app-other-artist-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './otherArtistProfile.component.html',
  styleUrl: './otherArtistProfile.component.css',
})
export class OtherArtistProfileComponent implements OnInit {
  artist: ArtistResponse | null = null;
  loading = false;
  errorMsg = '';

  constructor(private route: ActivatedRoute, private artistService: ArtistService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        const id = Number(idParam);
        this.loading = true;
        this.artistService.getArtistById(id).subscribe({
          next: (artist) => {
            this.artist = Array.isArray(artist) ? artist[0] : artist;
            this.loading = false;
          },
          error: (err) => {
            this.errorMsg = 'No se pudo cargar el perfil de artista.';
            this.loading = false;
          }
        });
      } else {
        this.errorMsg = 'Artista no encontrado.';
      }
    });
  }
}

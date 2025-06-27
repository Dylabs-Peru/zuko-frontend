import { ChangeDetectionStrategy, Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ArtistService } from '../../../../services/Artist.service';
import { ArtistResponse } from '../../../../models/artist.model';
import { SongResponse } from '../../../../models/song.model';
import { SongService } from '../../../../services/Song.service';
import { ArtistSongsComponent } from '../../../song/pages/artist-songs/artist-songs.component';

@Component({
  selector: 'app-other-artist-profile',
  standalone: true,
  imports: [CommonModule, ArtistSongsComponent],
  templateUrl: './otherArtistProfile.component.html',
  styleUrl: './otherArtistProfile.component.css',
})
export class OtherArtistProfileComponent implements OnInit {
  artist: ArtistResponse | null = null;
  loading = false;
  errorMsg = '';

  songs: SongResponse[] = [];
  songsLoading = true;
  songsError = '';

  constructor(private route: ActivatedRoute, private artistService: ArtistService, private songService: SongService) {}

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

            // 🔥 Obtener canciones públicas del artista
            this.songService.getSongsByArtist(this.artist?.id!).subscribe({
              next: (songs) => {
                this.songs = songs;
              },
              error: () => {
                this.songsError = 'No se pudieron cargar las canciones del artista.';
              }
            });
          },
          error: () => {
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

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AlbumService } from '../../../../services/Album.service';
import { ArtistService } from '../../../../services/Artist.service';
import { AlbumResponse } from '../../../../models/album.model';
import { ArtistResponse } from '../../../../models/artist.model';

@Component({
  selector: 'app-admin-albums-artist-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-albums-artist.component.html',
  styleUrls: ['./admin-albums-artist.component.css']
})
export class AdminAlbumsArtistComponent implements OnInit {
  onEditAlbum(album: any) {
    console.log('Editar álbum:', album);
  }
  onDeleteAlbum(album: any) {
    console.log('Eliminar álbum:', album);
  }
  onCreateAlbum() {
    console.log('Crear nuevo álbum');
  }
  artist: ArtistResponse | null = null;
  albums: AlbumResponse[] = [];
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private albumService: AlbumService,
    private artistService: ArtistService
  ) {}

  ngOnInit(): void {
    const artistId = Number(this.route.snapshot.paramMap.get('id'));
    if (!artistId) {
      this.router.navigate(['/admin/albums']);
      return;
    }
    this.loading = true;
    this.artistService.getArtistById(artistId).subscribe({
      next: (artist) => {
        this.artist = (artist as any).data;
        this.albumService.getAlbumsByArtist(artistId).subscribe({
          next: (albums) => {
            this.albums = albums;
            this.loading = false;
          },
          error: () => { this.loading = false; }
        });
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/admin/albums']);
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin/albums']);
  }
}

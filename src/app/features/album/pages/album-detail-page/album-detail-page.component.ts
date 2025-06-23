import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AlbumService } from '../../../../services/Album.service';

@Component({
  selector: 'app-album-detail-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './album-detail-page.component.html',
  styleUrls: ['./album-detail-page.component.css']
})
export class AlbumDetailPageComponent implements OnInit {
  album: any = null;
  loading = true;
  error = '';

  constructor(private route: ActivatedRoute, private albumService: AlbumService) {}

  ngOnInit() {
    const albumId = this.route.snapshot.paramMap.get('id');
    if (!albumId) {
      this.error = 'ID de álbum no especificado';
      this.loading = false;
      return;
    }
    this.loading = true;
    this.error = '';
    this.albumService.getAlbumById(Number(albumId)).subscribe({
      next: (res) => {
        this.album = res.data || res; // Ajusta según estructura real
        this.loading = false;
      },
      error: (err) => {
        this.error = 'No se pudo cargar el álbum';
        this.loading = false;
      }
    });
  }
}

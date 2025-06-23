import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

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

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const albumId = this.route.snapshot.paramMap.get('id');
    // Mock exacto según el diseño proporcionado
    this.album = {
      id: albumId,
      title: 'Hypnotize',
      artistName: 'System of A Down',
      releaseYear: 2005,
      cover: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Hypnotize_album_cover.jpg/220px-Hypnotize_album_cover.jpg',
      totalSongs: 11,
      songs: [
        { title: 'Attack', artistName: 'System Of A Down', genreName: 'Metal' },
        { title: 'Dreaming', artistName: 'System Of A Down', genreName: 'Metal' },
        { title: 'Holy Mountains', artistName: 'System Of A Down', genreName: 'Metal progresivo' },
        { title: 'Vicinity Of Obscenity', artistName: 'System Of A Down', genreName: 'Experimental' },
        { title: 'Lonely Day', artistName: 'System Of A Down', genreName: 'Rock alternativo' },
        { title: 'Soldier Side', artistName: 'System Of A Down', genreName: 'Metal' }
      ]
    };
    this.loading = false;
  }
}

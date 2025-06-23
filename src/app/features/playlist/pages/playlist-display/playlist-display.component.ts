import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ArtistSongsComponent } from "../../../song/pages/artist-songs/artist-songs.component";
import { DatePipe } from "@angular/common";
import { PlaylistService } from "../../../../services/playlist.service";
import { NgFor, NgIf, NgStyle } from "@angular/common";
import { PlaylistResponse } from "../../../../models/playlist.model";
@Component({
  selector: 'app-playlist-display',
  standalone: true,
  templateUrl: './playlist-display.component.html',
  styleUrls: ['./playlist-display.component.css'],
  imports: [NgIf, NgStyle, NgFor, DatePipe ]
})

export class PlaylistDisplayComponent implements OnInit {
  playlist: PlaylistResponse | null = null;
  error = '';
  loading = true

  constructor(
            private playlistService: PlaylistService, 
            private route: ActivatedRoute,
  ) {}
   
   ngOnInit(): void {
    const playlistId = this.route.snapshot.paramMap.get('id');
      if (!playlistId) {
        this.error = 'ID de playlist no especificado';
        this.loading = false;
        return;
      }
      this.loading = true;
      this.error = '';
      this.playlistService.getPlaylistById(Number(playlistId)).subscribe({
      next: (playlist) => {
        this.playlist = playlist;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'No se pudo cargar la playlist';
        this.loading = false;
      }
    });
    }
  }






  

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ArtistSongsComponent } from "../../../song/pages/artist-songs/artist-songs.component";
import { SongResponse } from "../../../../models/song.model";
import { PlaylistService } from "../../../../services/playlist.service";
@Component({
  selector: 'app-playlist-display',
  standalone: true,
  templateUrl: './playlist-display.component.html',
  styleUrls: ['./playlist-display.component.css'],
  imports: []
})

export class PlaylistDisplayComponent {
  songs: SongResponse[] = [];
  playlistName: string = '';
  error = '';
  createdAt: string = '';
  cover_url: string = '';
  playlistId: number = 0;

  constructor(
            private playlistService: PlaylistService, 
            private route: ActivatedRoute,
  ) {}
   
   ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('playlistId');
      if (id) {
        this.playlistId = +id;
        this.loadPlaylistSongs(this.playlistId);
        
      }
    });
  }

  loadPlaylistSongs(playlistId: number): void {
    this.playlistService.listSongsInPlaylist(playlistId).subscribe({
      next: (songs) => {
        this.songs = songs;
      },
      error: (err) => {
        this.error = 'Error al cargar las canciones de la playlist';
        console.error(err);
      }
    });
  }




  
}
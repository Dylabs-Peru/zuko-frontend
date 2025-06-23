import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ArtistSongsComponent } from "../../../song/pages/artist-songs/artist-songs.component";
import { DatePipe } from "@angular/common";
import { PlaylistService } from "../../../../services/playlist.service";
import { NgFor, NgIf, NgStyle } from "@angular/common";
import { PlaylistResponse } from "../../../../models/playlist.model";
import { PlaylistOptionsPopupComponent } from "../../components/playlist-options-popup/playlist-options-popup.component";
@Component({
  selector: 'app-playlist-display',
  standalone: true,
  templateUrl: './playlist-display.component.html',
  styleUrls: ['./playlist-display.component.css'],
  imports: [NgIf, NgStyle, NgFor, DatePipe, PlaylistOptionsPopupComponent ]
})

export class PlaylistDisplayComponent implements OnInit {
  playlist: PlaylistResponse | null = null;
  error = '';
  loading = true
  showMenu = false;

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

    onEditPlaylist() {
     // Lógica para editar playlist
    this.showMenu = false;
    }

    onDeletePlaylist() {
    // Lógica para eliminar playlist
    this.showMenu = false;
    }

  }






  

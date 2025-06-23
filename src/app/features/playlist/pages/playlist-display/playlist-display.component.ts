import { ConfirmDeleteDialogComponent } from './../../components/borrar-playlist/confirm-delete-dialog.component';
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Router } from "@angular/router";
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
  imports: [NgIf, NgStyle, NgFor, DatePipe, PlaylistOptionsPopupComponent, ConfirmDeleteDialogComponent  ]
})

export class PlaylistDisplayComponent implements OnInit {
  playlist: PlaylistResponse | null = null;
  error = '';
  loading = true
  showMenu = false;
  showDeleteDialog = false;

  constructor(
            private playlistService: PlaylistService, 
            private route: ActivatedRoute,
            private router: Router,
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
        this.showMenu = false;
    }

    onDeletePlaylist() {
        this.showDeleteDialog = true;
    }

    onConfirmDelete() {
    this.playlistService.deletePlaylist(this.playlist!.playlistId).subscribe({
      next: () => {
        this.showDeleteDialog = false;
        this.router.navigate(['/playlist/library']);
      },
      error: (err) => {
        alert('No se pudo borrar la playlist.');
        this.showDeleteDialog = false;
      }
    });
    }

    onCancelDelete() {
      this.showDeleteDialog = false;
    }

}






  

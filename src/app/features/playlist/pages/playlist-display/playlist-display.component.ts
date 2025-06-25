import { ConfirmDeleteDialogComponent } from './../../components/borrar-playlist/confirm-delete-dialog.component';
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Router } from "@angular/router";
import { DatePipe } from "@angular/common";
import { PlaylistService } from "../../../../services/playlist.service";
import { NgFor, NgIf, NgStyle } from "@angular/common";
import { PlaylistResponse } from "../../../../models/playlist.model";
import { PlaylistOptionsPopupComponent } from "../../components/playlist-options-popup/playlist-options-popup.component";
import { PlaylistSongsEditListComponent } from '../../components/editar-playlist/playlist-songs-edit-list.component';
import { AlbumService } from '../../../../services/Album.service';
import { AlbumResponse } from '../../../../models/album.model';
@Component({
  selector: 'app-playlist-display',
  standalone: true,
  templateUrl: './playlist-display.component.html',
  styleUrls: ['./playlist-display.component.css'],
  imports: [NgIf, NgStyle, NgFor, DatePipe, PlaylistOptionsPopupComponent, ConfirmDeleteDialogComponent, PlaylistSongsEditListComponent  ]
})

export class PlaylistDisplayComponent implements OnInit {
  playlist: PlaylistResponse | null = null;
  error = '';
  loading = true
  showMenu = false;
  showDeleteDialog = false;
  showEditDialog = false;
  albumMap: { [songId: number]: AlbumResponse|null } = {};
  userId: number | null = null;

  constructor(
            private playlistService: PlaylistService, 
            private route: ActivatedRoute,
            private router: Router,
            private albumService: AlbumService
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
        console.log('Playlist recibida:', playlist);
        if (playlist && Array.isArray(playlist.songs)) {
        console.log('Songs antes de filtrar:', playlist.songs);
        playlist.songs = playlist.songs.filter(song => song && song.title);
        console.log('Songs después de filtrar:', playlist.songs);
        playlist.songs.forEach(song => {
          this.albumService.getAlbumBySongId(song.id).subscribe({
            next: (album) => {
              this.albumMap[song.id] = album;
            },
            error: (err) => {
              this.albumMap[song.id] = null;
            }
          });
        });
      }

        this.playlist = playlist;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'No se pudo cargar la playlist';
        this.loading = false;
      }
    });

      const auth = localStorage.getItem('auth');
      if (auth) {
        const authObj = JSON.parse(auth);
        this.userId = authObj.user?.id || null;
      }
    }

    onEditPlaylist() {
        this.showMenu = false;
        this.showEditDialog = true;

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

    onSongRemoved(songId: number) {
      if (this.playlist) {
        this.playlist.songs = this.playlist.songs.filter(song => song.id !== songId);
      }
    }

    onCloseEditDialog() {
      this.showEditDialog = false;
    }

    onPlaylistEdited(editedPlaylist: PlaylistResponse) {
      this.playlist = editedPlaylist;
     this.showEditDialog = false;
    }

    canEdit(): boolean {
      return this.playlist?.ownerId === this.userId;
}



}






  

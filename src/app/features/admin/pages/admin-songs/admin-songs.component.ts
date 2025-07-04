import { Component, OnInit } from '@angular/core';
import { SongService } from '../../../../services/Song.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SongResponse, SongRequest } from '../../../../models/song.model';
import { ArtistService } from '../../../../services/Artist.service';
import { ArtistResponse } from '../../../../models/artist.model';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-admin-songs',
  standalone: true,
  imports: [CommonModule , ReactiveFormsModule, FormsModule ],
  templateUrl: './admin-songs.component.html',
  styleUrl: './admin-songs.component.css'
})
export class AdminSongsComponent implements OnInit {
  songs: SongResponse[] = [];
  artists: ArtistResponse[] = [];
  loading = false;
  error = '';

  showCreateForm = false;
  showEditForm = false;
  editingSong: SongResponse | null = null;

  createForm: FormGroup;
  editForm: FormGroup;
  coverFile: File | null = null;
  previewImageUrl: string | null = null;
  uploading = false;

  constructor(
    private songService: SongService,
    private artistService: ArtistService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.createForm = this.fb.group({
      title: ['', Validators.required],
      isPublicSong: [true],
      artistId: ['', Validators.required],
      youtubeUrl: [''],
      imageUrl: ['']
    });

    this.editForm = this.fb.group({
      title: ['', Validators.required],
      isPublicSong: [true],
      youtubeUrl: [''],
      imageUrl: ['']
    });
  }

  ngOnInit(): void {
    this.loadAllSongs();
    this.loadAllArtists();
  }

  loadAllSongs(): void {
  this.loading = true;
  this.songService.getAllSongs().subscribe({
    next: (data) => {
      this.songs = data;
      this.sortSongs(); // 🔁 Ordenar con el valor actual del filtro
      this.loading = false;
    },
    error: () => {
      this.error = 'Error al cargar las canciones';
      this.loading = false;
    }
  });
}

  loadAllArtists(): void {
    this.artistService.getAllArtists().subscribe({
      next: (data) => {
        this.artists = data;
      },
      error: () => {
        alert('Error al cargar artistas');
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin']);
  }

  openCreateForm() {
    this.showCreateForm = true;
    this.createForm.reset({ isPublicSong: true });
    this.previewImageUrl = null;
    this.coverFile = null;
  }

  openEditForm(song: SongResponse) {
    this.editingSong = song;
    this.editForm.patchValue({
      title: song.title,
      isPublicSong: song.isPublicSong,
      youtubeUrl: song.youtubeUrl,
      imageUrl: song.imageUrl || ''
    });
    this.previewImageUrl = song.imageUrl || null;
    this.coverFile = null;
    this.showEditForm = true;
  }

  closeForms() {
    this.showCreateForm = false;
    this.showEditForm = false;
    this.editingSong = null;
    this.previewImageUrl = null;
    this.coverFile = null;
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.[0]) return;

    const file = input.files[0];
    this.coverFile = file;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewImageUrl = e.target.result;
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'zuko_pfps');

    this.uploading = true;
    fetch('https://api.cloudinary.com/v1_1/dqk8inmwe/image/upload', {
      method: 'POST',
      body: formData
    })
      .then((res) => res.json())
      .then((data) => {
        this.uploading = false;
        if (data.secure_url) {
          if (this.showEditForm && this.editingSong) {
            this.editingSong.imageUrl = data.secure_url;
            this.editForm.patchValue({ imageUrl: data.secure_url });
          } else {
            this.createForm.patchValue({ imageUrl: data.secure_url });
          }
        } else {
          alert('Error al subir la imagen');
        }
      })
      .catch(() => {
        this.uploading = false;
        alert('Error al subir la imagen');
      });
  }

  createSong() {
    if (this.createForm.valid) {
      this.loading = true;
      const data: SongRequest = this.createForm.value;
      this.songService.createSong(data).subscribe({
        next: () => {
          this.loadAllSongs();
          this.closeForms();
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          alert('Error al crear canción');
        }
      });
    }
  }

  editSong() {
    if (this.editingSong && this.editForm.valid) {
      this.loading = true;
      const data: SongRequest = {
        ...this.editForm.value,
        artistId: this.editingSong.artistId
      };
      this.songService.updateSong(this.editingSong.id, data).subscribe({
        next: () => {
          this.loadAllSongs();
          this.closeForms();
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          alert('Error al actualizar canción');
        }
      });
    }
  }

  deleteSong(id: number) {
    if (confirm('¿Estás seguro de eliminar esta canción?')) {
      this.loading = true;
      this.songService.deleteSong(id).subscribe({
        next: () => {
          this.loadAllSongs();
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          alert('Error al eliminar canción');
        }
      });
    }
  }

  getImageUrl(imageUrl?: string): string {
    return imageUrl?.trim()
      ? imageUrl
      : 'https://res.cloudinary.com/dqk8inmwe/image/upload/v1750800568/pfp_placeholder_hwwumb.jpg';
  }

  selectedSort: string = 'newest';

  sortSongs(): void {
    switch (this.selectedSort) {
      case 'newest':
        this.songs.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
        break;
      case 'oldest':
        this.songs.sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
        break;
      case 'title':
        this.songs.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }
}

}

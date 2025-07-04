import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ArtistService } from '../../../../services/Artist.service';
import { ArtistResponse, CreateArtistRequest, UpdateArtistRequest } from '../../../../models/artist.model';
import { environment } from '../../../../../environments/environment';
import { UserService } from '../../../../services/User.service';
import { UserResponse } from '../../../../models/user.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-artists',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-artists.component.html',
  styleUrl: './admin-artists.component.css'
})
export class AdminArtistsComponent implements OnInit {

  artists: ArtistResponse[] = [];
  users: UserResponse[] = [];
  eligibleUsers: UserResponse[] = [];
  loading = false;

  // Modal states
  showCreateForm = false;
  showEditForm = false;

  // Current artist being edited
  editingArtist: ArtistResponse | null = null;

  // Image upload states
  createImagePreview: string = '';
  editImagePreview: string = '';
  uploadingImage = false;

  // Error handling
  createArtistError: string = '';
  editArtistError: string = '';

  // Forms
  createArtistForm: FormGroup;
  editArtistForm: FormGroup;

  constructor(
    private router: Router,
    private artistService: ArtistService,
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.createArtistForm = this.fb.group({
      userId: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      biography: ['', [Validators.required, Validators.minLength(10)]],
      country: ['', [Validators.required]],
      urlImage: [''],
      isActive: [true]
    });

    this.editArtistForm = this.fb.group({
      name: ['', [Validators.minLength(3)]],
      biography: ['', [Validators.minLength(10)]],
      country: [''],
      urlImage: [''],
      isActive: [true]
    });
  }

  ngOnInit() {
    this.loadArtistsAndUsers();
  }

  loadArtistsAndUsers() {
    this.loading = true;
    forkJoin({
      artists: this.artistService.getAllArtists(),
      users: this.userService.getAllUsers()
    }).subscribe({
      next: ({ artists, users }) => {
        this.users = users;
        // Vincular usuario a cada artista por userId
        this.artists = artists.map(artist => {
          const user = users.find(u => u.id === artist.userId);
          return { ...artist, user };
        });
        // Filtrar usuarios que NO tienen perfil de artista
        const artistUserIds = new Set(artists.map(a => a.userId));
        this.eligibleUsers = users.filter(u => !artistUserIds.has(u.id));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading artists or users:', error);
        this.loading = false;
      }
    });
  }

  loadArtists() {
    this.loading = true;
    this.artistService.getAllArtists().subscribe({
      next: (artists) => {
        this.artists = artists;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading artists:', error);
        this.loading = false;
      }
    });
  }

  // Crear Artista
  openCreateForm() {
    this.showCreateForm = true;
    this.createArtistForm.reset();
    this.createArtistForm.patchValue({ isActive: true });
    this.createImagePreview = '';
    this.createArtistError = '';
  }

  closeCreateForm() {
    this.showCreateForm = false;
    this.createArtistForm.reset();
    this.createImagePreview = '';
  }

  private updateUserImage(userId: number, urlImage: string, callback: () => void) {
  this.userService.updateUser(userId, { url_image: urlImage }).subscribe({
    next: () => callback(),
    error: () => callback() // Siempre recarga aunque falle la imagen
  });
}

onCreateArtist() {
  if (this.createArtistForm.valid) {
    this.loading = true;
    this.createArtistError = '';
    const formValue = this.createArtistForm.value;
    const artistData: CreateArtistRequest = {
      name: formValue.name,
      biography: formValue.biography,
      country: formValue.country,
      urlImage: this.createImagePreview || formValue.urlImage,
      userId: formValue.userId
    } as any;
    const selectedUser = this.eligibleUsers.find(u => u.id == formValue.userId);
    if (!selectedUser) {
      this.createArtistError = 'Usuario seleccionado no válido.';
      this.loading = false;
      return;
    }
    this.artistService.createArtist(selectedUser.username, artistData).subscribe({
      next: () => {
        this.loadArtistsAndUsers();
        this.closeCreateForm();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error creando artista:', error);
        this.loading = false;
        if (error.error?.message) {
          this.createArtistError = error.error.message;
        } else if (error.error?.error) {
          this.createArtistError = error.error.error;
        } else {
          this.createArtistError = 'Error desconocido al crear artista';
        }
      }
    });
  }
}


  // Editar Artista
  openEditForm(artist: ArtistResponse) {
    this.showEditForm = true;
    this.editingArtist = artist;
    this.editArtistForm.patchValue({
      name: artist.name,
      biography: artist.biography,
      country: artist.country,
      urlImage: artist.user?.url_image || artist.urlImage || ''
    });
    this.editImagePreview = artist.user?.url_image || artist.urlImage || '';
    this.editArtistError = '';
  }

  closeEditForm() {
    this.showEditForm = false;
    this.editingArtist = null;
    this.editArtistForm.reset();
    this.editImagePreview = '';
  }

  onEditArtist() {
    if (this.editArtistForm.valid && this.editingArtist) {
  this.loading = true;
  this.editArtistError = '';
  const updateData: UpdateArtistRequest = this.editArtistForm.value;
  const newUrlImage = updateData.urlImage;
  const artist = this.editingArtist;
  const userId = artist.userId;
  // Si hay nueva imagen y userId, primero actualiza el usuario (url_image), luego el artista
  if (userId !== undefined && userId !== null && Number.isFinite(userId) && newUrlImage) {
    this.userService.updateUser(userId, { url_image: newUrlImage }).subscribe({
      next: () => {
        this.artistService.updateArtist(artist.id, updateData).subscribe({
          next: () => {
            this.loadArtistsAndUsers();
            this.closeEditForm();
            this.loading = false;
          },
          error: (error) => {
            console.error('Error editando artista:', error);
            this.loading = false;
            if (error.error?.message) {
              this.editArtistError = error.error.message;
            } else if (error.error?.error) {
              this.editArtistError = error.error.error;
            } else {
              this.editArtistError = 'Error desconocido al editar artista';
            }
          }
        });
      },
      error: (error) => {
        console.error('Error actualizando usuario:', error);
        this.loading = false;
        this.editArtistError = 'Error actualizando imagen de usuario';
      }
    });
  } else {
    this.artistService.updateArtist(artist.id, updateData).subscribe({
      next: () => {
        this.loadArtistsAndUsers();
        this.closeEditForm();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error editando artista:', error);
        this.loading = false;
        if (error.error?.message) {
          this.editArtistError = error.error.message;
        } else if (error.error?.error) {
          this.editArtistError = error.error.error;
        } else {
          this.editArtistError = 'Error desconocido al editar artista';
        }
      }
    });
  }
}
  }

  // Image Upload Functions
  onCreateImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadingImage = true;
      this.createImagePreview = '';
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'zuko_pfps');
      
      // Mostrar preview local mientras sube
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.createImagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
      
      // Subir a Cloudinary
      fetch('https://api.cloudinary.com/v1_1/dqk8inmwe/image/upload', {
        method: 'POST',
        body: formData
      })
        .then(response => response.json())
        .then(data => {
          this.uploadingImage = false;
          if (data.secure_url) {
            this.createArtistForm.patchValue({ urlImage: data.secure_url });
          } else {
            console.error('Error al subir la imagen');
            alert('Error al subir la imagen');
          }
        })
        .catch((error) => {
          this.uploadingImage = false;
          console.error('Error uploading image:', error);
          alert('Error al subir la imagen');
        });
    }
  }

  onEditImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadingImage = true;
      this.editImagePreview = '';
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'zuko_pfps');
      
      // Mostrar preview local mientras sube
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.editImagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
      
      // Subir a Cloudinary
      fetch('https://api.cloudinary.com/v1_1/dqk8inmwe/image/upload', {
        method: 'POST',
        body: formData
      })
        .then(response => response.json())
        .then(data => {
          this.uploadingImage = false;
          if (data.secure_url) {
            this.editArtistForm.patchValue({ urlImage: data.secure_url });
          } else {
            console.error('Error al subir la imagen');
            alert('Error al subir la imagen');
          }
        })
        .catch((error) => {
          this.uploadingImage = false;
          console.error('Error uploading image:', error);
          alert('Error al subir la imagen');
        });
    }
  }

  // Toggle Active Status
  toggleArtistStatus(artist: ArtistResponse) {
    const action = artist.isActive ? 'desactivar' : 'activar';
    if (confirm(`¿Estás seguro de que quieres ${action} a ${artist.name}?`)) {
      this.loading = true;
      this.artistService.toggleArtistActiveStatus(artist.id).subscribe({
        next: () => {
          this.loadArtists();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error toggling artist status:', error);
          this.loading = false;
        }
      });
    }
  }

  // Custom password validator
  static passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasNumber = /[0-9]/.test(value);
    const hasLetter = /[a-zA-Z]/.test(value);
    const isValidLength = value.length >= 6;

    const passwordValid = hasNumber && hasLetter && isValidLength;

    if (!passwordValid) {
      const errors: ValidationErrors = {};
      if (!isValidLength) errors['minlength'] = { requiredLength: 6, actualLength: value.length };
      if (!hasNumber) errors['requiresNumber'] = true;
      if (!hasLetter) errors['requiresLetter'] = true;
      return errors;
    }

    return null;
  }

  // Utility methods

  getArtistStatusColor(isActive: boolean): string {
    return isActive ? '#4CAF50' : '#F44336';
  }

  /**
   * Obtiene la URL de la imagen de perfil o el placeholder por defecto
   */
  getProfileImageUrl(url_image: string | null | undefined): string {
    if (!url_image || url_image.trim() === '') {
      return environment.defaultProfileImage;
    }
    return url_image;
  }

  /**
   * Maneja errores de carga de imagen y establece el placeholder
   */
  onImageError(event: any): void {
    event.target.src = environment.defaultProfileImage;
  }

  /**
   * Obtiene el mensaje de error para un campo específico del formulario de creación
   */
  getCreateFieldError(fieldName: string): string {
    const field = this.createArtistForm.get(fieldName);
    if (field && field.invalid && field.touched) {
      if (field.errors?.['required']) {
        return `${this.getFieldDisplayName(fieldName)} es requerido`;
      }
      if (field.errors?.['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldDisplayName(fieldName)} debe tener al menos ${requiredLength} caracteres`;
      }
      if (field.errors?.['email']) {
        return 'El formato del email no es válido';
      }
      if (field.errors?.['requiresNumber']) {
        return 'La contraseña debe contener al menos un número';
      }
      if (field.errors?.['requiresLetter']) {
        return 'La contraseña debe contener al menos una letra';
      }
    }
    return '';
  }

  /**
   * Obtiene el nombre de display para un campo
   */
  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      'username': 'Nombre de usuario',
      'email': 'Email',
      'password': 'Contraseña',
      'description': 'Descripción'
    };
    return displayNames[fieldName] || fieldName;
  }

  goBack() {
    this.router.navigate(['/admin']);
  }
}

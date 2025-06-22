import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ArtistService } from '../../../../services/Artist.service';
import { CreateArtistRequest } from '../../../../models/artist.model';
import { ArtistResponse } from '../../../../models/artist.model';
import { Input } from '@angular/core';

@Component({
  selector: 'app-create-artist',
  standalone: true,  // Asegúrate de que sea standalone
  imports: [CommonModule, ReactiveFormsModule],  // Añade ReactiveFormsModule
  templateUrl: './create-artist.component.html',
  styleUrls: ['./create-artist.component.css']
})
export class CreateArtistComponent {
    @Input() username: string | null = null;
    artistForm: FormGroup;
    submitted = false;
    successMessage = '';
    errorMessage: string = '';
  
    @Output() close = new EventEmitter<void>();
    @Output() artistCreated = new EventEmitter<ArtistResponse>();
  
    constructor(
      private fb: FormBuilder,
      private artistService: ArtistService
    ) {
      this.artistForm = this.fb.group({
        name: ['', [Validators.required, Validators.maxLength(50)]],
        country: ['', Validators.required],
        biography: ['', [Validators.required, Validators.minLength(10)]],
      });
    }
  
    closeModal() {
      this.close.emit();
    }
  
    onSubmit() {
      this.submitted = true;
      if (this.artistForm.invalid) return;
  
      console.log('Username from @Input:', this.username);
  
      if (!this.username) {
        console.error('Username no encontrado en @Input');
        return;
      }
  
      const { name, country, biography } = this.artistForm.value;
      const request: CreateArtistRequest = { name, country, biography };
  
      this.artistService.createArtist(this.username, request).subscribe({
        next: (artist) => {
          this.successMessage = '¡Artista creado exitosamente!';
          this.artistForm.reset();
          this.submitted = false;
          this.artistCreated.emit(artist);
          setTimeout(() => this.closeModal(), 1500);
        },
        error: (err) => {
          this.successMessage = '';
          this.errorMessage = err.error?.message || 'Error al crear artista.';
        }
      });
    }
  }
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ArtistService } from '../../../../services/Artist.service';
import { CreateArtistRequest } from '../../../../models/artist.model';
import { ArtistResponse } from '../../../../models/artist.model';
import { UserService } from '../../../../services/User.service';
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

    dropdownOpen = false;
    selectedCountry: string | null = null;

    @Output() close = new EventEmitter<void>();
    @Output() artistCreated = new EventEmitter<ArtistResponse>();
  
    countries: string[] = [
      'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Costa Rica', 'Cuba', 'Ecuador', 'El Salvador', 'España',
      'Estados Unidos', 'Guatemala', 'Honduras', 'México', 'Nicaragua', 'Panamá', 'Paraguay', 'Perú', 'Puerto Rico',
      'República Dominicana', 'Uruguay', 'Venezuela', 'Canadá', 'Francia', 'Italia', 'Alemania', 'Reino Unido', 'Japón', 'China'
    ];

    constructor(
      private fb: FormBuilder,
      private artistService: ArtistService,
      private userService: UserService
    ) {
      this.artistForm = this.fb.group({
        name: ['', [Validators.required, Validators.maxLength(50)]],
        country: ['', Validators.required],
        biography: ['', [Validators.required, Validators.minLength(10)]],
      });
    }

    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen;
    }

    selectCountry(country: string) {
      this.selectedCountry = country;
      this.artistForm.get('country')?.setValue(country);
      this.dropdownOpen = false;
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
        next: (artist: any) => {
          console.log('Respuesta del backend al crear artista:', artist);
          this.successMessage = '¡Artista creado exitosamente!';
          this.artistForm.reset();
          this.submitted = false;
          this.artistCreated.emit(artist.data);
          // Ya no redirige ni hace logout aquí.
          this.close.emit();
        },
        error: (err) => {
          this.successMessage = '';
          this.errorMessage = err.error?.message || 'Error al crear artista.';
        }
      });
    }
  }
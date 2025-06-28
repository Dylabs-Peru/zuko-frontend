import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-artist-profile-modal',
  templateUrl: './edit-artist-profile-modal.component.html',
  styleUrls: ['./edit-artist-profile-modal.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class EditArtistProfileModalComponent {
  @Input() name: string = '';
  @Input() biography: string = '';
  @Input() country: string = '';
  @Output() save = new EventEmitter<{ name: string; biography: string; country: string }>();
  @Output() close = new EventEmitter<void>();

  countries: string[] = [
    'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Costa Rica', 'Cuba', 'Ecuador', 'El Salvador', 'España',
    'Estados Unidos', 'Guatemala', 'Honduras', 'México', 'Nicaragua', 'Panamá', 'Paraguay', 'Perú', 'Puerto Rico',
    'República Dominicana', 'Uruguay', 'Venezuela', 'Canadá', 'Francia', 'Italia', 'Alemania', 'Reino Unido', 'Japón', 'China'
  ];

  selectedImage: File | null = null;
  imagePreview: string | null = null;



  onSave() {
    this.save.emit({
      name: this.name,
      biography: this.biography,
      country: this.country
    });
  }

  onClose() {
    this.close.emit();
  }
}

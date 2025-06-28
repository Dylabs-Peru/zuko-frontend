import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';

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
  @Input() url_image: string = '';
  @Output() save = new EventEmitter<{ name: string; biography: string; country: string; url_image: string }>();
  @Output() close = new EventEmitter<void>();

  countries: string[] = [
    'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Costa Rica', 'Cuba', 'Ecuador', 'El Salvador', 'España',
    'Estados Unidos', 'Guatemala', 'Honduras', 'México', 'Nicaragua', 'Panamá', 'Paraguay', 'Perú', 'Puerto Rico',
    'República Dominicana', 'Uruguay', 'Venezuela', 'Canadá', 'Francia', 'Italia', 'Alemania', 'Reino Unido', 'Japón', 'China'
  ];

  imagePreview: string | null = null;
  selectedImage: File | null = null;

  ngOnInit() {
    this.imagePreview = this.url_image;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      this.imagePreview = '';
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'zuko_pfps');
      // Mostrar preview local mientras sube
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
      // Subir a Cloudinary
      fetch('https://api.cloudinary.com/v1_1/dqk8inmwe/image/upload', {
        method: 'POST',
        body: formData
      })
        .then(response => response.json())
        .then(data => {
          if (data.secure_url) {
            this.url_image = data.secure_url;
          } else {
            alert('Error al subir la imagen');
          }
        })
        .catch(() => {
          alert('Error al subir la imagen');
        });
    }
  }


  onSave() {
    this.save.emit({
      name: this.name,
      biography: this.biography,
      country: this.country,
      url_image: this.url_image
    });
  }

  onClose() {
    this.close.emit();
  }
}

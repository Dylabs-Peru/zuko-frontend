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
  @Input() urlImage: string = '';
  @Input() country: string = '';
  @Output() save = new EventEmitter<{ name: string; biography: string; country: string; urlImage: string }>();
  @Output() close = new EventEmitter<void>();

  selectedImage: File | null = null;
  imagePreview: string | null = null;

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedImage = event.target.files[0];
      // Previsualización instantánea
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(this.selectedImage!);
      // Subida a Cloudinary
      const formData = new FormData();
      formData.append('file', this.selectedImage!);
      formData.append('upload_preset', 'ml_default');
      fetch('https://api.cloudinary.com/v1_1/dqk8inmwe/image/upload', {
        method: 'POST',
        body: formData
      })
        .then(response => response.json())
        .then(data => {
          if (data.secure_url) {
            this.urlImage = data.secure_url;
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
      urlImage: this.urlImage
    });
  }

  onClose() {
    this.close.emit();
  }
}

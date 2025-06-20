import { Component, Output, EventEmitter, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-profile-modal',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './edit-profile-modal.component.html',
  styleUrls: ['./edit-profile-modal.component.css']
})
export class EditProfileModalComponent {
  @Input() username: string = '';
  @Input() description: string = '';
  @Input() url_image: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ username: string; description: string; url_image: string }>();

  imagePreview: string = '';

  ngOnInit() {
    this.imagePreview = this.url_image;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
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
    this.save.emit({ username: this.username, description: this.description, url_image: this.url_image });
  }

  onClose() {
    this.close.emit();
  }
}

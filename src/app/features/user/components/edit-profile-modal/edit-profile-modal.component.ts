import { Component, Output, EventEmitter, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { signal, computed } from '@angular/core';

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

  // Signals para el estado del modal
  imagePreview = signal('');
  uploadingImage = signal(false);
  
  // Computed signals para validaciones
  hasImagePreview = computed(() => this.imagePreview() !== '');
  canSave = computed(() => 
    this.username.trim() !== '' && !this.uploadingImage()
  );

  ngOnInit() {
    this.imagePreview.set(this.url_image);
    console.log('Inicializando preview de imagen:', this.url_image);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadingImage.set(true);
      this.imagePreview.set('');
      console.log('Archivo seleccionado para subir:', file.name);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'zuko_pfps');
      
      // Mostrar preview local mientras sube
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview.set(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Subir a Cloudinary
      fetch('https://api.cloudinary.com/v1_1/dqk8inmwe/image/upload', {
        method: 'POST',
        body: formData
      })
        .then(response => response.json())
        .then(data => {
          this.uploadingImage.set(false);
          if (data.secure_url) {
            this.url_image = data.secure_url;
            console.log(' Imagen subida exitosamente:', data.secure_url);
          } else {
            console.error(' Error al subir la imagen:', data);
            alert('Error al subir la imagen');
          }
        })
        .catch((error) => {
          this.uploadingImage.set(false);
          console.error(' Error en la subida:', error);
          alert('Error al subir la imagen');
        });
    }
  }

  onSave() {
    if (this.canSave()) {
      console.log(' Guardando cambios del perfil:', {
        username: this.username,
        description: this.description,
        url_image: this.url_image
      });
      this.save.emit({ 
        username: this.username, 
        description: this.description, 
        url_image: this.url_image 
      });
    }
  }

  onClose() {
    console.log(' Cerrando modal de edición');
    this.close.emit();
  }
}

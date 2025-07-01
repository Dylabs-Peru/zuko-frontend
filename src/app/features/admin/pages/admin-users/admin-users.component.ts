import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { UserService } from '../../../../services/User.service';
import { RoleService } from '../../../../services/Role.service';
import { UserResponse, CreateUserRequest, UpdateUserRequest } from '../../../../models/user.model';
import { RoleResponse } from '../../../../models/role.model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css'
})
export class AdminUsersComponent implements OnInit {
  
  users: UserResponse[] = [];
  roles: RoleResponse[] = [];
  loading = false;
  
  // Modal states
  showCreateForm = false;
  showEditForm = false;
  showRoleModal = false;
  
  // Current user being edited
  editingUser: UserResponse | null = null;
  userForRoleChange: UserResponse | null = null;
  
  // Image upload states
  createImagePreview: string = '';
  editImagePreview: string = '';
  uploadingImage = false;
  
  // Error handling
  createUserError: string = '';
  editUserError: string = '';
  
  // Forms
  createUserForm: FormGroup;
  editUserForm: FormGroup;
  roleForm: FormGroup;

  constructor(
    private router: Router,
    private userService: UserService,
    private roleService: RoleService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.createUserForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, AdminUsersComponent.passwordValidator]],
      description: [''],
      url_image: [''],
      roleName: ['User', [Validators.required]],
      isActive: [true]
    });

    this.editUserForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      description: [''],
      url_image: [''],
      password: [''] // Optional for edit
    });

    this.roleForm = this.fb.group({
      roleName: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadUsers();
    this.loadRoles();
  }

  loadUsers() {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = [...users]; // Crear una nueva referencia del array para forzar detección de cambios
        this.loading = false;
        this.cdr.detectChanges(); // Forzar detección de cambios
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading = false;
      }
    });
  }

  loadRoles() {
    this.roleService.getAllRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
      },
      error: (error) => {
        console.error('Error loading roles:', error);
      }
    });
  }
  // Create User
  openCreateForm() {
    this.showCreateForm = true;
    this.createUserForm.reset();
    this.createUserForm.patchValue({ 
      roleName: 'User', 
      isActive: true 
    });
    this.createImagePreview = '';
    this.createUserError = '';
  }

  closeCreateForm() {
    this.showCreateForm = false;
    this.createUserForm.reset();
    this.createImagePreview = '';
  }

  onCreateUser() {
    if (this.createUserForm.valid) {
      this.loading = true;
      this.createUserError = '';
      const userData: CreateUserRequest = this.createUserForm.value;
      
      this.userService.createUser(userData).subscribe({
        next: () => {
          this.loadUsers();
          this.closeCreateForm();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error creating user:', error);
          this.loading = false;
          
          // Handle specific error messages
          if (error.error?.message) {
            this.createUserError = error.error.message;
          } else if (error.error?.error) {
            this.createUserError = error.error.error;
          } else if (error.status === 409) {
            this.createUserError = 'El nombre de usuario o email ya están en uso';
          } else if (error.status === 400) {
            this.createUserError = 'Los datos proporcionados no son válidos';
          } else {
            this.createUserError = 'Error al crear el usuario. Intenta nuevamente.';
          }
        }
      });
    }
  }
  // Edit User
  openEditForm(user: UserResponse) {
    this.editingUser = user;
    this.showEditForm = true;
    this.editUserForm.patchValue({
      username: user.username,
      email: user.email,
      description: user.description,
      url_image: user.url_image
    });
    this.editImagePreview = user.url_image || '';
  }

  closeEditForm() {
    this.showEditForm = false;
    this.editingUser = null;
    this.editUserForm.reset();
    this.editImagePreview = '';
  }

  onEditUser() {
    if (this.editUserForm.valid && this.editingUser) {
      this.loading = true;
      const userData: UpdateUserRequest = this.editUserForm.value;
      
      // Remove password if empty
      if (!userData.password) {
        delete userData.password;
      }      this.userService.updateUser(this.editingUser.id, userData).subscribe({
        next: () => {
          this.loadUsers();
          this.closeEditForm();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.loading = false;
        }
      });
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
            this.createUserForm.patchValue({ url_image: data.secure_url });
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
            this.editUserForm.patchValue({ url_image: data.secure_url });
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
  toggleUserStatus(user: UserResponse) {
    const action = user.isActive ? 'desactivar' : 'activar';
    if (confirm(`¿Estás seguro de que quieres ${action} a ${user.username}?`)) {
      this.loading = true;
      this.userService.toggleUserActiveStatus(user.id).subscribe({
        next: (response) => {
          // Recargar la página para mostrar los cambios
          window.location.reload();
        },
        error: (error) => {
          console.error('Error toggling user status:', error);
          // Si el status es 200, es exitoso aunque Angular lo marque como error
          if (error.status === 200) {
            window.location.reload();
          } else {
            this.loading = false;
          }
        }
      });
    }
  }

  // Change Role
  openRoleModal(user: UserResponse) {
    this.userForRoleChange = user;
    this.showRoleModal = true;
    this.roleForm.patchValue({ roleName: user.roleName });
  }

  closeRoleModal() {
    this.showRoleModal = false;
    this.userForRoleChange = null;
    this.roleForm.reset();
  }

  onChangeRole() {
    if (this.roleForm.valid && this.userForRoleChange) {
      this.loading = true;
      const updateData: UpdateUserRequest = {
        roleName: this.roleForm.value.roleName
      };

      this.userService.updateUser(this.userForRoleChange.id, updateData).subscribe({
        next: () => {
          this.loadUsers();
          this.closeRoleModal();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error changing role:', error);
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
  getRoleColor(roleName: string): string {
    switch (roleName.toLowerCase()) {
      case 'admin': return '#D32F2F';
      case 'moderator': return '#FF9800';
      case 'artist': return '#9C27B0';
      default: return '#4CAF50';
    }
  }

  getUserStatusColor(isActive: boolean): string {
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
    const field = this.createUserForm.get(fieldName);
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
      'description': 'Descripción',
      'roleName': 'Rol'
    };
    return displayNames[fieldName] || fieldName;
  }

  goBack() {
    this.router.navigate(['/admin']);
  }
}

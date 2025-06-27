import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  
  // Forms
  createUserForm: FormGroup;
  editUserForm: FormGroup;
  roleForm: FormGroup;

  constructor(
    private router: Router,
    private userService: UserService,
    private roleService: RoleService,
    private fb: FormBuilder
  ) {
    this.createUserForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
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
        this.users = users;
        this.loading = false;
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
  }

  closeCreateForm() {
    this.showCreateForm = false;
    this.createUserForm.reset();
    this.createImagePreview = '';
  }

  onCreateUser() {
    if (this.createUserForm.valid) {
      this.loading = true;
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
        next: () => {
          this.loadUsers();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error toggling user status:', error);
          this.loading = false;
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

  goBack() {
    this.router.navigate(['/admin']);
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../../services/User.service';
import { RoleService } from '../../../../services/Role.service';
import { UserResponse, CreateUserRequest, UpdateUserRequest } from '../../../../models/user.model';
import { RoleResponse } from '../../../../models/role.model';
import { signal, computed } from '@angular/core';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css'
})
export class AdminUsersComponent implements OnInit {
  
  // Signals para estado principal
  users = signal<UserResponse[]>([]);
  roles = signal<RoleResponse[]>([]);
  loading = signal(false);
  
  // Signals para estados de modales
  showCreateForm = signal(false);
  showEditForm = signal(false);
  showRoleModal = signal(false);
  
  // Signals para usuarios en edición
  editingUser = signal<UserResponse | null>(null);
  userForRoleChange = signal<UserResponse | null>(null);
  
  // Signals para estados de imagen
  createImagePreview = signal('');
  editImagePreview = signal('');
  uploadingImage = signal(false);
  
  // Computed signals para estadísticas
  activeUsers = computed(() => 
    this.users().filter(user => user.isActive)
  );
  
  inactiveUsers = computed(() => 
    this.users().filter(user => !user.isActive)
  );
  
  adminUsers = computed(() => 
    this.users().filter(user => user.roleName?.toLowerCase() === 'admin')
  );
  
  totalUsers = computed(() => this.users().length);
  
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
    this.loading.set(true);
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
        console.log('👥 Usuarios cargados:', users.length);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading.set(false);
      }
    });
  }

  loadRoles() {
    this.roleService.getAllRoles().subscribe({
      next: (roles) => {
        this.roles.set(roles);
      },
      error: (error) => {
        console.error('Error loading roles:', error);
      }
    });
  }
  // Create User
  openCreateForm() {
    this.showCreateForm.set(true);
    this.createUserForm.reset();
    this.createUserForm.patchValue({ 
      roleName: 'User', 
      isActive: true 
    });
    this.createImagePreview.set('');
    console.log(' Abriendo formulario de crear usuario');
  }

  closeCreateForm() {
    this.showCreateForm.set(false);
    this.createUserForm.reset();
    this.createImagePreview.set('');
    console.log(' Cerrando formulario de crear usuario');
  }

  onCreateUser() {
    if (this.createUserForm.valid) {
      this.loading.set(true);
      const userData: CreateUserRequest = this.createUserForm.value;
      
      this.userService.createUser(userData).subscribe({
        next: (response: any) => {
          // Recargar la lista completa para asegurar consistencia
          this.loadUsers();
          this.closeCreateForm();
          console.log(' Usuario creado exitosamente');
        },
        error: (error) => {
          console.error('Error creating user:', error);
          this.loading.set(false);
        }
      });
    }
  }
  // Edit User
  openEditForm(user: UserResponse) {
    this.editingUser.set(user);
    this.showEditForm.set(true);
    this.editUserForm.patchValue({
      username: user.username,
      email: user.email,
      description: user.description,
      url_image: user.url_image
    });
    this.editImagePreview.set(user.url_image || '');
    console.log(' Abriendo formulario de editar usuario:', user.username);
  }

  closeEditForm() {
    this.showEditForm.set(false);
    this.editingUser.set(null);
    this.editUserForm.reset();
    this.editImagePreview.set('');
    console.log(' Cerrando formulario de editar usuario');
  }

  onEditUser() {
    if (this.editUserForm.valid && this.editingUser()) {
      this.loading.set(true);
      const userData: UpdateUserRequest = this.editUserForm.value;
      
      // Remove password if empty
      if (!userData.password) {
        delete userData.password;
      }
      
      this.userService.updateUser(this.editingUser()!.id, userData).subscribe({
        next: (response: any) => {
          // Recargar la lista completa para asegurar consistencia
          this.loadUsers();
          this.closeEditForm();
          console.log(' Usuario editado exitosamente');
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.loading.set(false);
        }
      });
    }
  }

  // Image Upload Functions
  onCreateImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadingImage.set(true);
      this.createImagePreview.set('');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'zuko_pfps');
      
      // Mostrar preview local mientras sube
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.createImagePreview.set(e.target.result);
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
            this.createUserForm.patchValue({ url_image: data.secure_url });
            console.log(' Imagen subida para crear usuario:', data.secure_url);
          } else {
            console.error('Error al subir la imagen');
            alert('Error al subir la imagen');
          }
        })
        .catch((error) => {
          this.uploadingImage.set(false);
          console.error('Error uploading image:', error);
          alert('Error al subir la imagen');
        });
    }
  }

  onEditImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadingImage.set(true);
      this.editImagePreview.set('');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'zuko_pfps');
      
      // Mostrar preview local mientras sube
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.editImagePreview.set(e.target.result);
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
            this.editUserForm.patchValue({ url_image: data.secure_url });
            console.log(' Imagen subida para editar usuario:', data.secure_url);
          } else {
            console.error('Error al subir la imagen');
            alert('Error al subir la imagen');
          }
        })
        .catch((error) => {
          this.uploadingImage.set(false);
          console.error('Error uploading image:', error);
          alert('Error al subir la imagen');
        });
    }
  }

  // Toggle Active Status
  toggleUserStatus(user: UserResponse) {
    const action = user.isActive ? 'desactivar' : 'activar';
    if (confirm(`¿Estás seguro de que quieres ${action} a ${user.username}?`)) {
      this.loading.set(true);
      this.userService.toggleUserActiveStatus(user.id).subscribe({
        next: () => {
          // Recargar la lista completa para asegurar consistencia
          this.loadUsers();
          console.log(` Estado de usuario ${user.username} cambiado a: ${!user.isActive ? 'activo' : 'inactivo'}`);
        },
        error: (error) => {
          console.error('Error toggling user status:', error);
          this.loading.set(false);
        }
      });
    }
  }

  // Change Role
  openRoleModal(user: UserResponse) {
    this.userForRoleChange.set(user);
    this.showRoleModal.set(true);
    this.roleForm.patchValue({ roleName: user.roleName });
    console.log(' Abriendo modal de cambio de rol para:', user.username);
  }

  closeRoleModal() {
    this.showRoleModal.set(false);
    this.userForRoleChange.set(null);
    this.roleForm.reset();
    console.log(' Cerrando modal de cambio de rol');
  }

  onChangeRole() {
    if (this.roleForm.valid && this.userForRoleChange()) {
      this.loading.set(true);
      const updateData: UpdateUserRequest = {
        roleName: this.roleForm.value.roleName
      };
      const userId = this.userForRoleChange()!.id;
      const newRoleName = this.roleForm.value.roleName;

      this.userService.updateUser(userId, updateData).subscribe({
        next: () => {
          // Recargar la lista completa para asegurar consistencia
          this.loadUsers();
          this.closeRoleModal();
          console.log(' Rol cambiado exitosamente a:', newRoleName);
        },
        error: (error) => {
          console.error('Error changing role:', error);
          this.loading.set(false);
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

  goBack() {
    this.router.navigate(['/admin']);
  }
}

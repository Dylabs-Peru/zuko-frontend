import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoleService } from '../../../../services/Role.service';
import { RoleResponse, CreateRoleRequest } from '../../../../models/role.model';

@Component({
  selector: 'app-admin-roles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-roles.component.html',
  styleUrl: './admin-roles.component.css'
})
export class AdminRolesComponent implements OnInit {
  
  roles: RoleResponse[] = [];
  showCreateForm = false;
  showEditForm = false;
  loading = false;
  editingRole: RoleResponse | null = null;
  
  roleForm: FormGroup;

  constructor(
    private router: Router,
    private roleService: RoleService,
    private fb: FormBuilder
  ) {
    this.roleForm = this.fb.group({
      roleName: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  ngOnInit() {
    this.loadRoles();
  }

  loadRoles() {
    this.loading = true;
    this.roleService.getAllRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.loading = false;
      }
    });
  }

  openCreateForm() {
    this.showCreateForm = true;
    this.showEditForm = false;
    this.editingRole = null;
    this.roleForm.reset();
  }

  openEditForm(role: RoleResponse) {
    this.showEditForm = true;
    this.showCreateForm = false;
    this.editingRole = role;
    this.roleForm.patchValue({
      roleName: role.roleName,
      description: role.description
    });
  }

  closeForm() {
    this.showCreateForm = false;
    this.showEditForm = false;
    this.editingRole = null;
    this.roleForm.reset();
  }

  onSubmit() {
    if (this.roleForm.valid) {
      const roleData: CreateRoleRequest = this.roleForm.value;
      
      if (this.showCreateForm) {
        this.createRole(roleData);
      } else if (this.showEditForm && this.editingRole) {
        this.updateRole(this.editingRole.id, roleData);
      }
    }
  }

  createRole(roleData: CreateRoleRequest) {
    this.loading = true;
    this.roleService.createRole(roleData).subscribe({
      next: () => {
        this.loadRoles();
        this.closeForm();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error creating role:', error);
        this.loading = false;
      }
    });
  }

  updateRole(id: number, roleData: CreateRoleRequest) {
    this.loading = true;
    this.roleService.updateRole(id, roleData).subscribe({
      next: () => {
        this.loadRoles();
        this.closeForm();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error updating role:', error);
        this.loading = false;
      }
    });
  }

  deleteRole(role: RoleResponse) {
    if (confirm(`¿Estás seguro de que quieres eliminar el rol "${role.roleName}"?`)) {
      this.loading = true;
      this.roleService.deleteRole(role.id).subscribe({
        next: () => {
          this.loadRoles();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error deleting role:', error);
          this.loading = false;
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/admin']);
  }
}

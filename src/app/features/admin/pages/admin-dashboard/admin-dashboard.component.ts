import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent {
  
  adminSections = [
    {
      id: 'users',
      title: 'Gestión de Usuarios',
      description: 'Administrar usuarios, roles y permisos',
      icon: '👥',
      route: '/admin/users',
      color: '#2196F3'
    },
    {
      id: 'genres',
      title: 'Gestión de Géneros',
      description: 'Crear, editar y eliminar géneros musicales',
      icon: '🎵',
      route: '/admin/genres',
      color: '#4CAF50'
    },
    {
      id: 'roles',
      title: 'Gestión de Roles',
      description: 'Configurar roles y permisos del sistema',
      icon: '🔐',
      route: '/admin/roles',
      color: '#FF9800'
    }
  ];

  constructor(private router: Router) {}

  navigateToSection(route: string) {
    this.router.navigate([route]);
  }
}

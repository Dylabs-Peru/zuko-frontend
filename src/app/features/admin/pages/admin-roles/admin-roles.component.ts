import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-roles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-roles.component.html',
  styleUrl: './admin-roles.component.css'
})
export class AdminRolesComponent {
  
  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/admin']);
  }
}

import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'zuko-frontend';
  currentUrl = '';

  constructor(private router: Router) {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.currentUrl = e.urlAfterRedirects;
    });
    // Inicializa la url actual
    this.currentUrl = this.router.url;
  }

  get isAuthRoute(): boolean {
    // Debug: muestra la url current
    console.log('Current URL:', this.currentUrl);
    // Oculta navbar si la url contiene /auth, /login o /register en cualquier parte
    return (
      this.currentUrl.includes('/auth/login') ||
      this.currentUrl.includes('/auth/register') ||
      this.currentUrl === '/auth' ||
      this.currentUrl === '/login' ||
      this.currentUrl === '/register'
    );
  }
}

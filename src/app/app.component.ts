import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/Auth.service';
import { TokenMonitorService } from './services/TokenMonitor.service';
import { MusicPlayerService } from './services/music-player.service';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'zuko-frontend';
  currentUrl = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private tokenMonitorService: TokenMonitorService,
    private musicPlayerService: MusicPlayerService
  ) {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.currentUrl = e.urlAfterRedirects;
    });
    // Inicializa la url actual
    this.currentUrl = this.router.url;
  }

  ngOnInit(): void {
    // Verificar si hay un token válido al iniciar la app
    const hasValidToken = this.authService.checkAndCleanExpiredToken();
    
    if (hasValidToken) {
      // Iniciar el monitoreo del token
      this.tokenMonitorService.startMonitoring();
      console.log('Monitor de token iniciado');
    }

    // Inicializar el reproductor global
    this.initializeGlobalPlayer();
  }

  ngOnDestroy(): void {
    // Detener el monitoreo al destruir el componente
    this.tokenMonitorService.stopMonitoring();
  }

  get isAuthRoute(): boolean {
    // Debug: muestra la url current
    // Oculta navbar si la url contiene /auth, /login o /register en cualquier parte
    return (
      this.currentUrl.includes('/auth/login') ||
      this.currentUrl.includes('/auth/register') ||
      this.currentUrl === '/auth' ||
      this.currentUrl === '/login' ||
      this.currentUrl === '/register'
    );
  }

  private initializeGlobalPlayer(): void {
    // Esperar a que YouTube API esté disponible
    if (!(window as any).YT) {
      console.log('⏳ Esperando YouTube API...');
      setTimeout(() => this.initializeGlobalPlayer(), 100);
      return;
    }

    console.log('🎯 Inicializando reproductor global');
    this.musicPlayerService.initializeGlobalPlayer('global-yt-player');
  }
}

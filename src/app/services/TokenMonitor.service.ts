import { Injectable, NgZone } from '@angular/core';
import { AuthService } from './Auth.service';
import { interval, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TokenMonitorService {
  private monitorSubscription?: Subscription;
  private readonly CHECK_INTERVAL = 60000; // Verificar cada minuto
  private readonly WARNING_THRESHOLD = 5; // Avisar cuando queden 5 minutos

  constructor(
    private authService: AuthService,
    private ngZone: NgZone
  ) {}

  /**
   * Inicia el monitoreo del token
   */
  startMonitoring(): void {
    if (this.monitorSubscription) {
      this.stopMonitoring();
    }

    this.ngZone.runOutsideAngular(() => {
      this.monitorSubscription = interval(this.CHECK_INTERVAL).subscribe(() => {
        this.ngZone.run(() => {
          this.checkTokenStatus();
        });
      });
    });

    // Verificar inmediatamente
    this.checkTokenStatus();
  }

  /**
   * Detiene el monitoreo del token
   */
  stopMonitoring(): void {
    if (this.monitorSubscription) {
      this.monitorSubscription.unsubscribe();
      this.monitorSubscription = undefined;
    }
  }

  /**
   * Verifica el estado actual del token
   */
  private checkTokenStatus(): void {
    const token = this.authService.getToken();
    
    if (!token) {
      this.stopMonitoring();
      return;
    }

    if (this.authService.isTokenExpired(token)) {
      console.log('Token expirado detectado por monitor');
      this.authService.logout('Token expirado detectado por monitor');
      this.stopMonitoring();
      return;
    }

    const timeRemaining = this.authService.getTokenTimeRemaining();
    
    if (timeRemaining <= this.WARNING_THRESHOLD && timeRemaining > 0) {
      this.showExpirationWarning(timeRemaining);
    }
  }

  /**
   * Muestra una advertencia de que el token está por expirar
   */
  private showExpirationWarning(minutesRemaining: number): void {
    const message = `Tu sesión expirará en ${minutesRemaining} minuto${minutesRemaining !== 1 ? 's' : ''}. ¿Deseas continuar?`;
    
    if (confirm(message)) {
      // El usuario quiere continuar, podrías renovar el token aquí si tienes esa funcionalidad
      console.log('Usuario decidió continuar con la sesión');
    } else {
      // El usuario decidió salir
      this.authService.logout('Usuario decidió terminar sesión al ser avisado de expiración');
    }
  }
}

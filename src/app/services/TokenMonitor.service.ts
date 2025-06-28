import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { AuthService } from './Auth.service';
import { interval, Subscription, fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TokenMonitorService implements OnDestroy {
  private monitorSubscription?: Subscription;
  private errorListenerSubscription?: Subscription;
  private readonly CHECK_INTERVAL = 60000; // Verificar cada minuto
  private readonly WARNING_THRESHOLD = 5; // Avisar cuando queden 5 minutos
  private readonly JWT_ERROR_KEYWORDS = [
    'JWT signature does not match',
    'signature verification failed',
    'invalid signature',
    'token signature invalid',
    'malformed jwt'
  ];

  constructor(
    private authService: AuthService,
    private ngZone: NgZone
  ) {
    this.setupGlobalErrorListener();
  }

  /**
   * Configura un listener global para errores relacionados con JWT
   */
  private setupGlobalErrorListener(): void {
    // Escuchar errores de consola que pueden indicar problemas con JWT
    this.errorListenerSubscription = fromEvent(window, 'error')
      .pipe(
        filter((event: any) => {
          const message = event.error?.message || event.message || '';
          return this.isJWTError(message.toLowerCase());
        })
      )
      .subscribe(() => {
        console.warn('Error de JWT detectado globalmente, limpiando tokens...');
        this.handleInvalidToken('Error de JWT detectado globalmente');
      });

    // Escuchar cambios en localStorage (para detección entre tabs)
    fromEvent(window, 'storage').subscribe((event: any) => {
      if (event.key === 'token' || event.key === 'auth') {
        if (!event.newValue) {
          // Token eliminado en otro tab
          console.log('Token eliminado en otro tab, deteniendo monitoreo');
          this.stopMonitoring();
        } else if (event.newValue && !this.monitorSubscription) {
          // Token agregado en otro tab, iniciar monitoreo
          console.log('Token agregado en otro tab, iniciando monitoreo');
          this.startMonitoring();
        }
      }
    });
  }

  /**
   * Verifica si un mensaje de error está relacionado con JWT
   */
  private isJWTError(message: string): boolean {
    return this.JWT_ERROR_KEYWORDS.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * Maneja tokens inválidos
   */
  private handleInvalidToken(reason: string): void {
    console.log(`Token inválido detectado: ${reason}`);
    this.authService.logout(`Token inválido: ${reason}`);
    this.stopMonitoring();
  }

  /**
   * Verifica la integridad del token almacenado
   */
  private verifyTokenIntegrity(): boolean {
    const token = this.authService.getToken();
    
    if (!token) {
      return false;
    }

    try {
      // Verificar que el token tenga la estructura correcta de JWT
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('Token con estructura JWT inválida detectado');
        this.handleInvalidToken('Estructura de token inválida');
        return false;
      }

      // Intentar decodificar el payload
      const payload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      JSON.parse(payload);
      
      return true;
    } catch (error) {
      console.error('Error verificando integridad del token:', error);
      this.handleInvalidToken('Token corrupto o malformado');
      return false;
    }
  }

  /**
   * Inicia el monitoreo del token
   */
  startMonitoring(): void {
    if (this.monitorSubscription) {
      this.stopMonitoring();
    }

    // Verificar integridad del token antes de iniciar el monitoreo
    if (!this.verifyTokenIntegrity()) {
      return;
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
    
    if (this.errorListenerSubscription) {
      this.errorListenerSubscription.unsubscribe();
      this.errorListenerSubscription = undefined;
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

    // Verificar integridad del token
    if (!this.verifyTokenIntegrity()) {
      return; // verifyTokenIntegrity ya maneja la limpieza
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

  /**
   * Maneja errores HTTP que pueden indicar problemas con el token
   */
  handleHttpError(error: any): void {
    if (!error) return;

    const errorMessage = error.message || error.error?.message || '';
    const statusCode = error.status;

    // Verificar errores relacionados con JWT
    if (this.isJWTError(errorMessage)) {
      console.warn('Error JWT detectado en respuesta HTTP:', errorMessage);
      this.handleInvalidToken(`Error HTTP JWT: ${errorMessage}`);
      return;
    }

    // Verificar códigos de estado que indican problemas de autenticación
    if (statusCode === 401 || statusCode === 403) {
      console.warn(`Error de autenticación detectado (${statusCode}):`, errorMessage);
      this.handleInvalidToken(`Error de autenticación HTTP ${statusCode}`);
    }
  }

  /**
   * Fuerza una verificación inmediata del token
   */
  forceTokenCheck(): void {
    this.checkTokenStatus();
  }

  /**
   * Valida si el token actual es válido contra el backend
   * y lo limpia si es inválido
   */
  validateAndCleanInvalidToken(): void {
    const token = this.authService.getToken();
    if (!token) return;

    // Si el token existe pero el backend devuelve errores de firma,
    // es probable que la clave secreta haya cambiado
    console.log('Validando token después de error de autenticación...');
    this.handleInvalidToken('Token inválido detectado por el backend - posible cambio de clave secreta');
  }

  /**
   * Reinicia el monitoreo después de un login exitoso
   */
  restartMonitoring(): void {
    this.stopMonitoring();
    this.startMonitoring();
  }

  /**
   * Limpia recursos al destruir el servicio
   */
  ngOnDestroy(): void {
    this.stopMonitoring();
  }
}

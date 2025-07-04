import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { AuthService } from './Auth.service';
import { UserService } from './User.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

declare global {
  interface Window {
    google: any;
  }
}

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  provider: string;
}

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  private googleUserSubject = new BehaviorSubject<GoogleUser | null>(null);
  public googleUser$ = this.googleUserSubject.asObservable();
  private isGoogleLoaded = false;
  private currentGoogleToken: string | null = null; // Almacenar el token actual

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {
    this.loadGoogleScript();
  }

  /**
   * Carga el script de Google Identity Services
   */
  private loadGoogleScript(): void {
    if (this.isGoogleLoaded) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      this.isGoogleLoaded = true;
      this.initializeGoogleAuth();
    };
    document.head.appendChild(script);
  }

  /**
   * Inicializa Google Auth
   */
  private initializeGoogleAuth(): void {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response: any) => this.handleCredentialResponse(response),
        auto_select: false,
        cancel_on_tap_outside: true
      });
    }
  }

  /**
   * Maneja la respuesta de credenciales de Google
   */
  private handleCredentialResponse(response: any): void {
    try {
      // Almacenar el token JWT de Google
      this.currentGoogleToken = response.credential;
      
      // Decodificar el JWT token de Google para logging
      const payload = this.decodeJWT(response.credential);
      console.log('🔍 Payload completo del JWT de Google:', payload);
      
      if (payload) {
        const googleUser: GoogleUser = {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          firstName: payload.given_name || '',
          lastName: payload.family_name || '',
          photoUrl: payload.picture || '',
          provider: 'google'
        };

        console.log('👤 Usuario de Google procesado:', googleUser);
        console.log('🔑 JWT Token que se enviará al backend:', response.credential.substring(0, 50) + '...');

        this.googleUserSubject.next(googleUser);
        this.handleGoogleLogin(googleUser);
      }
    } catch (error) {
      console.error('Error procesando respuesta de Google:', error);
    }
  }

  /**
   * Decodifica un JWT token
   */
  private decodeJWT(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Token JWT inválido');
      }

      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error decodificando JWT:', error);
      return null;
    }
  }

  /**
   * Inicia sesión con Google
   */
  signInWithGoogle(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isGoogleLoaded || !window.google) {
        reject(new Error('Google Auth no está cargado'));
        return;
      }

      try {
        // Primero intentar con el prompt automático
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Si no se muestra el prompt, mostrar mensaje explicativo
            console.log('Prompt no mostrado, usar botón manual');
          }
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Renderiza el botón de Google en un elemento específico
   */
  renderGoogleButton(elementId: string): void {
    if (!this.isGoogleLoaded || !window.google) {
      console.error('Google Auth no está cargado');
      return;
    }

    const element = document.getElementById(elementId);
    if (element) {
      window.google.accounts.id.renderButton(element, {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: 'continue_with'
      });
    }
  }

  /**
   * Maneja el login de Google usando el endpoint específico
   */
  private handleGoogleLogin(googleUser: GoogleUser): void {
    console.log('Usuario de Google autenticado:', googleUser);
    
    // Obtener el contexto desde la URL actual
    const currentUrl = this.router.url;
    const context = currentUrl.includes('/auth/register') ? 'register' : 'login';
    console.log('URL actual:', currentUrl);
    console.log('Contexto detectado:', context);
    
    // Obtener el token JWT de Google desde la respuesta inicial
    const googleToken = this.currentGoogleToken;
    if (!googleToken) {
      console.error('No se pudo obtener el token de Google');
      alert('Error al obtener el token de Google. Por favor, intenta de nuevo.');
      return;
    }

    // Preparar datos para el endpoint específico de Google
    const googleRequest = {
      googleToken: googleToken
    };

    if (context === 'login') {
      // Intentar login con Google
      this.attemptGoogleLogin(googleRequest, googleUser);
    } else {
      // Intentar registro con Google
      this.attemptGoogleRegister(googleRequest, googleUser);
    }
  }

  /**
   * Intenta hacer login con Google
   */
  private attemptGoogleLogin(googleRequest: any, googleUser: GoogleUser): void {
    console.log('🔑 Intentando login con Google...');

    this.userService.loginWithGoogle(googleRequest).subscribe({
      next: (response: any) => {
        console.log(' Login con Google exitoso:', response);
        
        // Mensaje de bienvenida personalizado
        const userName = response.user?.name || googleUser.name || 'Usuario';
        console.log(`¡Bienvenido de vuelta, ${userName}!`);
        
        // Guardar token y datos de autenticación usando el servicio existente
        this.authService.saveAuthData(response.token, response);
        
        // Redirigir según el rol del usuario
        this.redirectAfterLogin(response);
      },
      error: (error: any) => {
        console.error(' Error en login con Google:', error);
        console.log('Status del error:', error.status);
        
        // Extraer mensaje específico del backend
        const errorMessage = this.extractErrorMessage(error);
        
        // Si el usuario no existe, mostrar confirmación para registrarse
        if (error.status === 404 || error.status === 401 || errorMessage.includes('not found') || errorMessage.includes('No existe una cuenta')) {
          console.log(' Usuario no encontrado en /auth/login - mostrando confirmación');
          this.showRegistrationConfirmation(googleUser);
        } else {
          // Mostrar mensaje específico del backend
          alert(`Error al iniciar sesión con Google:\n\n${errorMessage}`);
        }
      }
    });
  }

  /**
   * Intenta hacer registro con Google
   */
  private attemptGoogleRegister(googleRequest: any, googleUser: GoogleUser): void {
    console.log(' Intentando registro con Google...');

    this.userService.registerWithGoogle(googleRequest).subscribe({
      next: (response: any) => {
        console.log(' Registro con Google exitoso:', response);
        
        // Mostrar mensaje de éxito
        alert(`¡Bienvenido a Zuko, ${googleUser.name}!\\n\\nTu cuenta ha sido creada exitosamente.`);
        
        // El registro con Google debería devolver directamente el token de autenticación
        const authData = response.data || response; // Dependiendo de si viene wrapeado en ApiResponse
        
        // Guardar token y datos de autenticación
        this.authService.saveAuthData(authData.token, authData);
        
        // Redirigir después del registro
        this.redirectAfterLogin(authData);
      },
      error: (error: any) => {
        console.error(' Error al registrar con Google:', error);
        
        // Extraer mensaje específico del backend
        const errorMessage = this.extractErrorMessage(error);
        
        // Si la cuenta ya existe, hacer login automático
        if (error.status === 409 || errorMessage.includes('already exists') || errorMessage.includes('Ya existe una cuenta')) {
          console.log('Cuenta ya existe en contexto REGISTER - haciendo login automático');
          this.handleAccountAlreadyExistsForGoogle(googleRequest, googleUser);
        } else {
          // Mostrar mensaje específico del backend
          alert(`Error al crear cuenta con Google:\n\n${errorMessage}`);
        }
      }
    });
  }

  /**
   * Extrae el mensaje de error del backend de manera segura
   */
  private extractErrorMessage(error: any): string {
    try {
      console.log('🔍 Error completo recibido:', error);
      
      // 1. Primero intentar obtener el mensaje de la excepción del backend
      if (error?.error?.message) {
        console.log('Mensaje de excepción encontrado:', error.error.message);
        return error.error.message;
      }
      
      // 2. Si el error viene como string directo
      if (typeof error?.error === 'string') {
        console.log('Error como string:', error.error);
        return error.error;
      }
      
      // 3. Intentar obtener desde diferentes ubicaciones comunes
      if (error?.message) {
        console.log('Mensaje desde error.message:', error.message);
        return error.message;
      }
      
      // 4. Para errores HTTP, intentar extraer el mensaje del body
      if (error?.error?.error) {
        console.log('Mensaje desde error.error.error:', error.error.error);
        return error.error.error;
      }
      
      // 5. Si hay un objeto de error con detalles
      if (error?.error && typeof error.error === 'object') {
        // Intentar encontrar cualquier campo que contenga el mensaje
        const errorObj = error.error;
        const possibleFields = ['message', 'error', 'detail', 'description', 'exception'];
        
        for (const field of possibleFields) {
          if (errorObj[field] && typeof errorObj[field] === 'string') {
            console.log(` Mensaje encontrado en ${field}:`, errorObj[field]);
            return errorObj[field];
          }
        }
      }
      
      // 6. Si es un error HTTP con status, mostrar información básica
      if (error?.status) {
        const statusMessage = `Error ${error.status}${error.statusText ? ': ' + error.statusText : ''}`;
        console.log(' Mensaje de status HTTP:', statusMessage);
        return statusMessage;
      }
      
      // 7. Fallback - convertir todo el error a string si es posible
      const errorString = JSON.stringify(error);
      if (errorString && errorString !== '{}') {
        console.log(' Error serializado:', errorString);
        return 'Error del servidor: ' + errorString;
      }
      
      // 8. Fallback final
      console.log(' Usando mensaje genérico');
      return 'Ha ocurrido un error inesperado en el servidor. Por favor, intenta de nuevo.';
      
    } catch (e) {
      console.error('❌ Error extrayendo mensaje de error:', e);
      return 'Ha ocurrido un error inesperado. Por favor, intenta de nuevo.';
    }
  }

  /**
   * Cierra sesión de Google
   */
  signOutFromGoogle(): void {
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
    this.googleUserSubject.next(null);
    this.currentGoogleToken = null; // Limpiar el token también
  }

  /**
   * Muestra confirmación al usuario para registrarse con Google
   */
  private showRegistrationConfirmation(googleUser: GoogleUser): void {
    const userName = googleUser.name || googleUser.email;
    const message = `¡Hola ${userName}!\n\nEsta cuenta de Google no está registrada aún en Zuko.\n\n¿Quieres crear una cuenta nueva con esta información de Google?`;
    
    const userConfirmed = confirm(message);
    
    if (userConfirmed) {
      console.log('Usuario confirmó registro con Google');
      
      // Preparar datos para el endpoint de registro
      const googleRequest = {
        googleToken: this.currentGoogleToken || ''
      };
      
      this.attemptGoogleRegister(googleRequest, googleUser);
    } else {
      console.log('Usuario canceló registro con Google');
      this.handleRegistrationCancelled(googleUser);
    }
  }

  /**
   * Maneja cuando el usuario cancela el registro
   */
  private handleRegistrationCancelled(googleUser: GoogleUser): void {
    alert('Registro cancelado. Puedes intentar con una cuenta diferente o crear una cuenta manual.');
    // Limpiar estado de Google Auth
    this.signOutFromGoogle();
  }

  /**
   * Maneja cuando la cuenta ya existe en contexto de Google
   */
  private handleAccountAlreadyExistsForGoogle(googleRequest: any, googleUser: GoogleUser): void {
    const userName = googleUser.name || 'Usuario';
    alert(`Esta cuenta ya está registrada en Zuko.\n\nSe iniciará sesión con la cuenta de ${userName}.`);
    
    console.log('Haciendo login automático con cuenta existente desde register...');
    
    // Hacer login directo usando el endpoint de Google
    this.attemptGoogleLogin(googleRequest, googleUser);
  }

  /**
   * Redirige al usuario después del login según su rol
   */
  private redirectAfterLogin(authResponse: any): void {
    const userRole = authResponse.user?.role || authResponse.role;
    
    switch (userRole) {
      case 'admin':
        this.router.navigate(['/admin']);
        break;
      case 'artist':
        this.router.navigate(['/artist/profile']);
        break;
      case 'user':
      default:
        this.router.navigate(['/home']);
        break;
    }
  }

  /**
   * Verifica si el usuario actual está autenticado con Google
   */
  isLoggedInWithGoogle(): boolean {
    return this.googleUserSubject.value !== null;
  }

  /**
   * Obtiene el usuario actual de Google
   */
  getCurrentGoogleUser(): GoogleUser | null {
    return this.googleUserSubject.value;
  }

}

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private router: Router) {}

  /**
   * Verifica si existe un token válido en localStorage
   */
  hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    
    return !this.isTokenExpired(token);
  }

  /**
   * Obtiene el token del localStorage
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Obtiene la información de autenticación del localStorage
   */
  getAuthInfo(): any | null {
    const authString = localStorage.getItem('auth');
    if (!authString) {
      return null;
    }
    
    try {
      return JSON.parse(authString);
    } catch (error) {
      console.error('Error parsing auth info:', error);
      this.clearAuthData();
      return null;
    }
  }

  /**
   * Verifica si el token JWT ha expirado
   */
  isTokenExpired(token: string): boolean {
    try {
      // Decodificar el payload del JWT
      const payload = this.decodeJWT(token);
      
      if (!payload || !payload.exp) {
        console.warn('Token sin información de expiración');
        return true;
      }

      // La exp viene en segundos, pero Date.now() está en milisegundos
      const currentTime = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp < currentTime;
      
      if (isExpired) {
        console.log('Token expirado. Expira:', new Date(payload.exp * 1000), 'Ahora:', new Date());
      }
      
      return isExpired;
    } catch (error) {
      console.error('Error verificando expiración del token:', error);
      return true;
    }
  }

  /**
   * Decodifica un JWT sin verificar la firma
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
   * Limpia todos los datos de autenticación del localStorage
   */
  clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('auth');
    this.isAuthenticatedSubject.next(false);
    console.log('Datos de autenticación limpiados del localStorage');
  }

  /**
   * Realiza logout y limpia los datos
   */
  logout(reason: string = 'Manual logout'): void {
    console.log(`Realizando logout: ${reason}`);
    this.clearAuthData();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Verifica y limpia tokens expirados
   * Retorna true si el token es válido, false si fue limpiado
   */
  checkAndCleanExpiredToken(): boolean {
    const token = this.getToken();
    
    if (!token) {
      return false;
    }

    if (this.isTokenExpired(token)) {
      this.logout('Token expirado');
      return false;
    }

    return true;
  }

  /**
   * Guarda los datos de autenticación
   */
  saveAuthData(token: string, authInfo: any): void {
    localStorage.setItem('token', token);
    localStorage.setItem('auth', JSON.stringify(authInfo));
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Obtiene el tiempo restante del token en minutos
   */
  getTokenTimeRemaining(): number {
    const token = this.getToken();
    if (!token) return 0;

    try {
      const payload = this.decodeJWT(token);
      if (!payload || !payload.exp) return 0;

      const currentTime = Math.floor(Date.now() / 1000);
      const timeRemaining = payload.exp - currentTime;
      
      return Math.max(0, Math.floor(timeRemaining / 60)); // Retorna en minutos
    } catch (error) {
      return 0;
    }
  }
}

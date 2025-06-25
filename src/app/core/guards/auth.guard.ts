import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../../services/Auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  // Verificar y limpiar token expirado
  const hasValidToken = authService.checkAndCleanExpiredToken();
  const authInfo = authService.getAuthInfo();
  const rolename = authInfo?.user?.roleName;

  // Si estamos en una ruta de auth (login/register) y hay token válido, redirigir al dashboard
  if (state.url.startsWith('/auth') && hasValidToken) {
    router.navigate(['/home']);
    return false;
  }

  // Si estamos en una ruta protegida y no hay token válido, redirigir al login
  if (!state.url.startsWith('/auth') && !hasValidToken) {
    router.navigate(['/auth/login']);
    return false;
  }

  // Verificar permisos de admin
  if(state.url.startsWith('/admin') && hasValidToken && rolename !== 'ADMIN') {
    router.navigate(['/home']);
    return false;
  }

  return true;
};
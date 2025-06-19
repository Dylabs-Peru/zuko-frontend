import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  // Si estamos en una ruta de auth (login/register) y hay token, redirigir al dashboard
  if (state.url.startsWith('/auth') && token) {
    router.navigate(['/dashboard']);
    return false;
  }

  // Si estamos en una ruta protegida y no hay token, redirigir al login
  if (!state.url.startsWith('/auth') && !token) {
    router.navigate(['/auth/login']);
    return false;
  }

  return true;
}; 
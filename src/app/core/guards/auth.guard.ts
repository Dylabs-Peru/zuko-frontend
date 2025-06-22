import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const authString = localStorage.getItem('auth');
  const auth = authString ? JSON.parse(authString) : null;
  const rolename = auth?.user?.roleName;

  // Si estamos en una ruta de auth (login/register) y hay token, redirigir al dashboard
  if (state.url.startsWith('/auth') && token) {
    router.navigate(['/home']);
    return false;
  }

  // Si estamos en una ruta protegida y no hay token, redirigir al login
  if (!state.url.startsWith('/auth') && !token) {
    router.navigate(['/auth/login']);
    return false;
  }

  if(state.url.startsWith('/admin') && token && rolename !== 'ADMIN') {
    router.navigate(['/home']);
    return false;
  }

  return true;
}; 
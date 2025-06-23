import { HttpInterceptorFn, HttpErrorResponse } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "../services/Auth.service";
import { catchError, throwError } from "rxjs";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Verificar si el token ha expirado antes de cada request
  const hasValidToken = authService.checkAndCleanExpiredToken();
  
  if (hasValidToken) {
    const token = authService.getToken();
    if (token) {
      const cloned = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      
      return next(cloned).pipe(
        catchError((error: HttpErrorResponse) => {
          // Si el servidor responde con 401 (Unauthorized), el token puede haber expirado
          if (error.status === 401) {
            console.log('Respuesta 401 recibida, verificando token...');
            authService.logout('Token inválido - respuesta 401 del servidor');
          }
          return throwError(() => error);
        })
      );
    }
  }
  
  return next(req);
};

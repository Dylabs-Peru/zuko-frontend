import { HttpInterceptorFn, HttpErrorResponse } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "../services/Auth.service";
import { TokenMonitorService } from "../services/TokenMonitor.service";
import { catchError, throwError } from "rxjs";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const tokenMonitor = inject(TokenMonitorService);
  
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
          console.error('Error HTTP interceptado:', error);
          
          // Usar el TokenMonitor para manejar el error
          tokenMonitor.handleHttpError(error);
          
          // Si el servidor responde con 401 (Unauthorized), es muy probable que el token sea inválido
          // debido a un cambio en la clave secreta del backend
          if (error.status === 401) {
            console.warn('Error 401 detectado - Token posiblemente inválido debido a cambio en clave secreta del backend');
            tokenMonitor.validateAndCleanInvalidToken();
          }
          
          return throwError(() => error);
        })
      );
    }
  }
  
  return next(req);
};

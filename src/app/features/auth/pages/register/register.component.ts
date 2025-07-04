import { CommonModule } from "@angular/common";
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Component, OnInit } from "@angular/core";
import { RouterLink } from '@angular/router';
import { UserService } from "../../../../services/User.service";
import { GoogleAuthService } from "../../../../services/GoogleAuth.service";

@Component({
    selector: 'app-register',
    standalone: true,
    templateUrl:  './register.component.html',
    imports: [CommonModule, RouterLink, ReactiveFormsModule],
    styleUrls: ['./register.component.css']
})

export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  loading: boolean = false;
  errorMessages: string[] = [];
  successMessage: string = '';
  showFallbackButton: boolean = false;

  constructor(
    private fb: FormBuilder,
    private UserService: UserService,
    private googleAuthService: GoogleAuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3)
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+={}|\\[\]\\:;"'<>,.?/-]{6,}$/)
      ]]
    });
  }

  ngOnInit() {
    // Renderizar el botón de Google después de que el componente se inicialice
    setTimeout(() => {
      this.googleAuthService.renderGoogleButton('google-signin-button-register');
      // Mostrar botón fallback después de 3 segundos si Google no carga
      setTimeout(() => {
        const googleButton = document.getElementById('google-signin-button-register');
        if (!googleButton || googleButton.children.length === 0) {
          this.showFallbackButton = true;
        }
      }, 3000);
    }, 500);
  }

  onSubmit() {
    this.errorMessages = [];
    this.successMessage = '';

    // Validar formulario antes de enviar
    if (this.registerForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    this.UserService.createUser(this.registerForm.value).subscribe({
      next: () => {
        this.successMessage = 'Usuario registrado exitosamente. Redirigiendo al login...';
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error en el registro:', error);
        this.handleError(error);
        this.loading = false;
      }
    });
  }

  private markFormGroupTouched() {
    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.markAsTouched();
    });
  }

  private handleError(error: any) {
    this.errorMessages = [];
    
    if (error.error && error.error.message) {
      // Error del backend con mensaje específico
      if (typeof error.error.message === 'string') {
        this.errorMessages.push(error.error.message);
      } else if (Array.isArray(error.error.message)) {
        this.errorMessages = error.error.message;
      }
    } else if (error.error && error.error.errors) {
      // Errores de validación del backend
      this.errorMessages = Object.values(error.error.errors).flat() as string[];
    } else if (error.status === 409) {
      // Conflicto - usuario ya existe
      this.errorMessages.push('El nombre de usuario o email ya existe');
    } else if (error.status === 400) {
      // Bad Request - datos inválidos
      this.errorMessages.push('Los datos proporcionados no son válidos');
    } else if (error.status === 0) {
      // Error de conexión
      this.errorMessages.push('Error de conexión. Verifica tu conexión a internet');
    } else {
      // Error genérico
      this.errorMessages.push('Error inesperado. Intenta nuevamente');
    }
  }

  // Métodos para obtener errores de validación del frontend
  getUsernameError(): string {
    const control = this.registerForm.get('username');
    if (control?.touched && control?.invalid) {
      if (control.errors?.['required']) {
        return 'El nombre de usuario no puede estar vacío';
      }
      if (control.errors?.['minlength']) {
        return 'El nombre de usuario debe tener al menos 3 caracteres';
      }
    }
    return '';
  }

  getEmailError(): string {
    const control = this.registerForm.get('email');
    if (control?.touched && control?.invalid) {
      if (control.errors?.['required']) {
        return 'El correo electrónico no puede estar vacío';
      }
      if (control.errors?.['email']) {
        return 'El correo electrónico debe ser válido';
      }
    }
    return '';
  }

  getPasswordError(): string {
    const control = this.registerForm.get('password');
    if (control?.touched && control?.invalid) {
      if (control.errors?.['required']) {
        return 'La contraseña no puede estar vacía';
      }
      if (control.errors?.['minlength']) {
        return 'La contraseña debe tener al menos 6 caracteres';
      }
      if (control.errors?.['pattern']) {
        return 'La contraseña debe contener al menos una letra, un número y puede contener símbolos';
      }
    }
    return '';
  }

  /**
   * Inicia sesión con Google
   */
  signInWithGoogle(): void {
    if (this.loading) return;
    
    this.loading = true;
    this.errorMessages = [];
    console.log('🔍 Iniciando Google Auth desde /auth/register');
    
    this.googleAuthService.signInWithGoogle().then(() => {
      console.log('Proceso de Google Auth iniciado desde register');
      // El resto del proceso se maneja en el GoogleAuthService
    }).catch((error) => {
      console.error('Error al iniciar registro con Google:', error);
      this.loading = false;
      this.errorMessages = ['Error al conectar con Google. Por favor, intenta de nuevo.'];
    });
  }
} 

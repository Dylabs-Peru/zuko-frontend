import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from "../../../../services/User.service";
import { ArtistService } from "../../../../services/Artist.service";
import { AuthService } from "../../../../services/Auth.service";
import { TokenMonitorService } from "../../../../services/TokenMonitor.service";
import { GoogleAuthService } from "../../../../services/GoogleAuth.service";
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, RouterLink, ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading: boolean = false;
  showFallbackButton: boolean = false;

  constructor(
    private fb: FormBuilder,
    private UserService: UserService,
    private artistService: ArtistService,
    private authService: AuthService,
    private tokenMonitorService: TokenMonitorService,
    private googleAuthService: GoogleAuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Renderizar el botón de Google después de que el componente se inicialice
    setTimeout(() => {
      this.googleAuthService.renderGoogleButton('google-signin-button');
      // Mostrar botón fallback después de 3 segundos si Google no carga
      setTimeout(() => {
        const googleButton = document.getElementById('google-signin-button');
        if (!googleButton || googleButton.children.length === 0) {
          this.showFallbackButton = true;
        }
      }, 3000);
    }, 500);
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      console.log('Iniciando login...');
      this.UserService.login(this.loginForm.value).subscribe({        next: (response) => {
          // Usar el servicio de autenticación para guardar los datos
          this.authService.saveAuthData(response.token, response);
          console.log('Login exitoso:', response);

          this.artistService.getAllArtists().subscribe({
            next: (artists) => {
              console.log('Respuesta de getAllArtists:', artists);
              let artistList: any[] = [];
              if (Array.isArray(artists)) {
                artistList = artists;
              } else if (artists && Array.isArray((artists as any).data)) {
                artistList = (artists as any).data;
              }
              const userId = (response as any)?.user?.id;
              const artist = artistList.find((a: any) => a.userId === userId && a.isActive);
              if (artist) {
                const auth = JSON.parse(localStorage.getItem('auth') || '{}');
                if (auth.user) {
                  auth.user.artistName = artist.name;
                  localStorage.setItem('auth', JSON.stringify(auth));
                }
                console.log('Artista detectado tras login:', artist.name);
                alert('¡Bienvenido, artista ' + artist.name + '! Tu perfil de artista está activo.');
              } else {
                // Si no hay artista activo, borra artistName si existe
                const auth = JSON.parse(localStorage.getItem('auth') || '{}');
                if (auth.user && auth.user.artistName) {
                  delete auth.user.artistName;
                  localStorage.setItem('auth', JSON.stringify(auth));
                }
                console.warn('No se detectó perfil de artista activo para este usuario tras login.');
              }
              this.loading = false;
              // Iniciar el monitor de token después del login exitoso
              this.tokenMonitorService.startMonitoring();
              window.location.href = '/home';
            },
            error: (err) => {
              this.loading = false;
              console.error('Error buscando artistas tras login:', err);
              alert('Error buscando artistas tras login.');
              window.location.href = '/home';
            }
          });
        },
        error: (error) => {
          console.error('Error en el login:', error);
          this.loading = false;
          alert('Error en el login: ' + (error.error?.message || 'Verifica tus credenciales.'));
        }
      });
    }
  }

  /**
   * Inicia sesión con Google
   */
  signInWithGoogle(): void {
    if (this.loading) return;
    
    this.loading = true;
    console.log('🔍 Iniciando Google Auth desde /auth/login');
    
    this.googleAuthService.signInWithGoogle().then(() => {
      console.log('Proceso de Google Auth iniciado desde login');
      // El resto del proceso se maneja en el GoogleAuthService
    }).catch((error) => {
      console.error('Error al iniciar login con Google:', error);
      this.loading = false;
      alert('Error al conectar con Google. Por favor, intenta de nuevo.');
    });
  }
}
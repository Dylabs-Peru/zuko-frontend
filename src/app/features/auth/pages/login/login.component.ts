import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from "../../../../services/User.service";
import { ArtistService } from "../../../../services/Artist.service";
import { AuthService } from "../../../../services/Auth.service";
import { TokenMonitorService } from "../../../../services/TokenMonitor.service";
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, RouterLink, ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading: boolean = false;  constructor(
    private fb: FormBuilder,
    private UserService: UserService,
    private artistService: ArtistService,
    private authService: AuthService,
    private tokenMonitorService: TokenMonitorService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
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
}
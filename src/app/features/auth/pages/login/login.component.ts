import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from "../../../../services/User.service";
import { ArtistService } from "../../../../services/Artist.service";
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
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private UserService: UserService,
    private artistService: ArtistService,
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
      this.UserService.login(this.loginForm.value).subscribe({
        next: (response) => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('auth', JSON.stringify(response));
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
              const artist = artistList.find((a: any) => a.userId === userId);
              if (artist) {
                const auth = JSON.parse(localStorage.getItem('auth') || '{}');
                if (auth.user) {
                  auth.user.artistName = artist.name;
                  localStorage.setItem('auth', JSON.stringify(auth));
                }
                console.log('Artista detectado tras login:', artist.name);
                alert('¡Bienvenido, artista ' + artist.name + '! Tu perfil de artista está activo.');
              } else {
                console.warn('No se detectó perfil de artista para este usuario tras login.');
        
              }
              this.loading = false;
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
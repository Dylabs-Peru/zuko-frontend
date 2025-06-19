import { CommonModule } from "@angular/common";
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Component } from "@angular/core";
import { RouterLink } from '@angular/router';
import { UserService } from "../../../../services/User.service";

@Component({
    selector: 'app-register',
    standalone: true,
    templateUrl:  './register.component.html',
    imports: [CommonModule, RouterLink, ReactiveFormsModule],
    styleUrls: ['./register.component.scss']
})

export class RegisterComponent {
  registerForm: FormGroup;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private UserService: UserService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.loading = true;
      this.UserService.createUser(this.registerForm.value).subscribe({
        next: () => {
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          console.error('Error en el registro:', error);
          // Aquí podrías mostrar un mensaje de error
          this.loading = false;
        }
      });
    }
  }
} 

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../../../services/User.service';
import { UserResponse } from '../../../../../models/user.model';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-other-profile',
  imports: [CommonModule],
  templateUrl: './otherProfile.component.html',
  standalone: true,
  styleUrl: './otherProfile.component.css',
})
export class OtherProfileComponent implements OnInit{
  user: UserResponse | null = null;
  userNotFound: boolean = false;
  userInactive: boolean = false;

  constructor(
    private userService: UserService, 
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const username = params.get('username');
      console.log('Username param:', username);
      if (username) {
        this.userService.getUserByUsername(username).subscribe(user => {
          console.log('User response:', user);
          
          // Verificar si el usuario está activo
          if (user && user.isActive === false) {
            console.log('Usuario inactivo, redirigiendo...');
            this.userInactive = true;
            this.user = null;
            // Opcional: redirigir a una página de error o home
            // this.router.navigate(['/']);
          } else {
            this.user = user;
            this.userInactive = false;
          }
          this.userNotFound = false;
        }, err => {
          console.error('Error al buscar usuario:', err);
          this.user = null;
          this.userNotFound = true;
          this.userInactive = false;
        });
      } else {
        this.user = null;
        this.userNotFound = true;
        this.userInactive = false;
      }
    });
  }
}

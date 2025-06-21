import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../../../services/User.service';
import { UserResponse } from '../../../../../models/user.model';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-other-profile',
  imports: [CommonModule],
  templateUrl: './otherProfile.component.html',
  standalone: true,
  styleUrl: './otherProfile.component.css',
})
export class OtherProfileComponent implements OnInit{
  user: UserResponse | null = null;

  constructor(private userService: UserService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const username = params.get('username');
      console.log('Username param:', username);
      if (username) {
        this.userService.getUserByUsername(username).subscribe(user => {
          console.log('User response:', user);
          this.user = user;
        }, err => {
          console.error('Error al buscar usuario:', err);
          this.user = null;
        });
      } else {
        this.user = null;
      }
    });
  }
}

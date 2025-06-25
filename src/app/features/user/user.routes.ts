import { Routes } from '@angular/router';
import { ProfileComponent } from './pages/profile/profile.component';
import { OtherProfileComponent } from './pages/otherUserProfile/otherProfile/otherProfile.component';

export const USER_ROUTES: Routes = [
  {
    path: 'Myprofile',
    component: ProfileComponent
  },
  {
    path: 'profile/:username',
    component: OtherProfileComponent
  }
];

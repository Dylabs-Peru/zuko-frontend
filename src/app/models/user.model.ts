export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  url_image?: string;
  description?: string;
  roleName?: string; 
  isActive?: boolean;
  // Campos adicionales para Google Auth
  isGoogleAuth?: boolean;
  googleId?: string;
  googleData?: {
    name?: string;
    firstName?: string;
    lastName?: string;
    photoUrl?: string;
    provider?: string;
  };
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  description?: string;
  url_image?: string;
  password?: string;
  roleName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  // Campos adicionales para Google Auth
  isGoogleAuth?: boolean;
  googleId?: string;
  googleData?: {
    name?: string;
    firstName?: string;
    lastName?: string;
    photoUrl?: string;
    provider?: string;
  };
}

export interface GoogleOAuthRequest {
  googleToken: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  description: string;
  url_image: string;
  roleName: string;
  isActive: boolean;
  isArtist?: boolean;
  artistName?: string;
}

export interface AuthResponse {
  token: string;
  UserResponse: UserResponse;
}
export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  url_image?: string;
  description?: string;
  roleName?: string; 
  isActive?: boolean;  
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
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  description: string;
  url_image: string;
  roleName: string;
  isActive: boolean;
}

export interface AuthResponse {
  token: string;
  UserResponse: UserResponse;
}
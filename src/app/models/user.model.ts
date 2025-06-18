export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  url_image?: string;
  description?: string;
  roleName?: string;     // por defecto: "USER" si no se manda
  isActive?: boolean;    // por defecto: true si no se manda
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
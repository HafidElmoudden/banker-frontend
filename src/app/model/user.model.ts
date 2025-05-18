export interface User {
  id: number;
  username: string;
  password?: string;
  email: string;
  roles: string[];
  active: boolean;
  createdAt?: Date;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
} 
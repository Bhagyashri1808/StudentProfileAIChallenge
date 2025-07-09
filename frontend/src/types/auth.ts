export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'teacher' | 'student';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'teacher' | 'student';
}

export interface AuthResponse {
  message: string;
  user: User;
}

export interface ApiError {
  error: string;
  message: string;
}
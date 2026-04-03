export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  phone?: string;
  address?: string;
  city?: string;
  avatar?: string;
  role?: string;
}

export interface RegisterDTO {
  username: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface UpdateProfileDTO {
  id: string;
  username?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  imageFile?: Express.Multer.File;
}

export interface AuthResponse {
  user: User;
  token: string;
}

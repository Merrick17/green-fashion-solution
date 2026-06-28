export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  DESIGNER = 'DESIGNER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  blocked: boolean;
  emailNotifications: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: UserRole;
  blocked?: boolean;
}

export interface AdminCreateUserDto {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface UpdateUserRoleDto {
  role: UserRole;
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  refreshToken: string;
  confirmationToken: string;
}

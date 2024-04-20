export interface StoredUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  token: string;
  refreshToken?: string;
  tokenExpiration: number;
}

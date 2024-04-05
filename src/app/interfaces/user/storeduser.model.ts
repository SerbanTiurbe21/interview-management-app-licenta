export interface StoredUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  token: string;
  refreshToken?: string;
  tokenExpiration: number;
}

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../interfaces/user/user.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { RetrievedUser } from '../interfaces/user/retrieveduser.model';
import { AuthResponse } from '../interfaces/authresponse.model';
import { StoredUser } from '../interfaces/user/storeduser.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private url = 'http://localhost:8080/api/v1/users';
  private keycloakBaseUrl: string =
    'http://localhost:9090/realms/springboot-microservice-realm/protocol/openid-connect';
  private client_id: string = 'microservice-auth';
  activeUser = new BehaviorSubject<StoredUser | null>(null);
  private tokenExpiretimer: any;

  constructor(private http: HttpClient, private router: Router) {
    this.autoLogin();
    this.initSessionCheck();
    this.listenToStorageEvents();
  }

  private initSessionCheck(): void {
    // Check every minute to be safe
    setInterval(() => {
      this.autoLogin();
    }, 60 * 1000); // 60 * 1000 milliseconds = 1 minute
  }

  private listenToStorageEvents(): void {
    window.addEventListener('storage', (event) => {
      if (event.key === 'userData') {
        this.autoLogin();
      }
    });
  }

  private refreshAccessToken(refreshToken: string): Observable<AuthResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    const body = new HttpParams()
      .set('client_id', this.client_id)
      .set('grant_type', 'refresh_token')
      .set('refresh_token', refreshToken);

    return this.http.post<AuthResponse>(
      `${this.keycloakBaseUrl}/token`,
      body.toString(),
      { headers }
    );
  }

  handleTokenRefresh(userData: StoredUser): void {
    const expiresIn =
      new Date(userData.tokenExpiration).getTime() - new Date().getTime();
    // Refresh if less than 1 minute left (60000 milliseconds)
    if (expiresIn < 60000) {
      if (userData.refreshToken) {
        this.refreshAccessToken(userData.refreshToken).subscribe({
          next: (response) => {
            console.log('Token refreshed:', response);
            this.updateUserInformation(response, userData);
            this.setAutoLogout(response.expires_in * 1000);
          },
          error: (error) => {
            console.error('Error refreshing token:', error);
            this.logout();
          },
        });
      } else {
        console.error('Refresh token is undefined.');
        this.logout();
      }
    }
  }

  updateUserInformation(
    authResponse: AuthResponse,
    userData: StoredUser
  ): void {
    const expirationDate = new Date(
      new Date().getTime() + authResponse.expires_in * 1000
    );
    const updatedUser: StoredUser = {
      ...userData,
      token: authResponse.access_token,
      refreshToken: authResponse.refresh_token,
      tokenExpiration: expirationDate.getTime(),
    };
    localStorage.setItem('userData', JSON.stringify(updatedUser));
    this.activeUser.next(updatedUser);
  }

  autoLogin(): void {
    const userData: StoredUser | null = this.getUserFromLocalStorage();
    if (!userData) {
      return;
    }

    const expirationMs = new Date(userData.tokenExpiration).getTime();
    const nowMs = new Date().getTime();

    if (userData.token && expirationMs > nowMs) {
      this.activeUser.next({
        ...userData,
        tokenExpiration: expirationMs,
      });

      this.handleTokenRefresh(userData);
    } else {
      this.logout();
    }
  }

  setAutoLogout(duration: number): void {
    if (this.tokenExpiretimer) {
      clearTimeout(this.tokenExpiretimer);
    }
    this.tokenExpiretimer = setTimeout(() => {
      this.logout();
    }, duration);
  }

  register(user: User): Observable<void> {
    const completeUrl = `${this.url}/create-user`;
    return this.http.post<void>(completeUrl, user);
  }

  getUserByEmail(email: String): Observable<RetrievedUser> {
    const completeUrl = `${this.url}/email?email=${email}`;
    return this.http.get<RetrievedUser>(completeUrl);
  }

  login(email: String, password: String): Observable<AuthResponse> {
    const headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    const body: HttpParams = new HttpParams()
      .set('client_id', this.client_id)
      .set('username', email.toString())
      .set('password', password.toString())
      .set('grant_type', 'password');

    return this.http.post<AuthResponse>(
      `${this.keycloakBaseUrl}/token`,
      body.toString(),
      { headers }
    );
  }

  storeUserInformation(
    authResponse: AuthResponse,
    retrievedUser: RetrievedUser
  ): void {
    const expiresInDuration = authResponse.expires_in * 1000;
    const expirationDate = new Date(new Date().getTime() + expiresInDuration);
    const storedUser: StoredUser = {
      id: retrievedUser.id,
      username: retrievedUser.username,
      firstName: retrievedUser.firstName,
      lastName: retrievedUser.lastName,
      email: retrievedUser.email,
      token: authResponse.access_token,
      refreshToken: authResponse.refresh_token,
      tokenExpiration: expirationDate.getTime(),
    };
    localStorage.setItem('userData', JSON.stringify(storedUser));
    this.activeUser.next(storedUser);
  }

  logout(): void {
    this.activeUser.next(null);
    this.router.navigate(['/login']);
    localStorage.removeItem('userData');

    if (this.tokenExpiretimer) {
      clearTimeout(this.tokenExpiretimer);
    }
  }

  getUserFromLocalStorage(): StoredUser | null {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  getActiveUser(): Observable<StoredUser | null> {
    return this.activeUser.asObservable();
  }

  updateActiveUserLastName(newLastName: string): void {
    const currentUser = this.activeUser.getValue();
    if (currentUser) {
      const updatedUser: StoredUser = {
        ...currentUser,
        lastName: newLastName,
      };

      localStorage.setItem('userData', JSON.stringify(updatedUser));

      this.activeUser.next(updatedUser);
    }
  }

  isAuthenticated(): boolean {
    const user = this.activeUser.value;
    return !!user && new Date(user.tokenExpiration) > new Date();
  }
}

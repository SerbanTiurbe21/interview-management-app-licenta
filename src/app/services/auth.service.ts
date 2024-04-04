import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../interfaces/user/user.model';
import { Observable } from 'rxjs';
import { RetrievedUser } from '../interfaces/user/retrieveduser.model';
import { AuthResponse } from '../interfaces/authresponse.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private url = 'http://localhost:8080/api/v1/users';
  private keycloakBaseUrl: string =
    'http://localhost:9090/realms/springboot-microservice-realm/protocol/openid-connect';
  private client_id: string = 'microservice-auth';

  constructor(private http: HttpClient) {}

  register(user: User): Observable<void> {
    const completeUrl = `${this.url}/create-user`;
    return this.http.post<void>(completeUrl, user);
  }

  getUserByEmail(email: String): Observable<RetrievedUser> {
    const completeUrl = `${this.url}/email/${email}`;
    return this.http.get<RetrievedUser>(completeUrl);
  }

  login(email: String, password: String): Observable<AuthResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    const body = new HttpParams()
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
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../interfaces/user/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private url = 'http://localhost:8080/api/v1/users';
  constructor(private http: HttpClient) {}

  register(user: User) {
    const completeUrl = `${this.url}/create-user`;
    return this.http.post(completeUrl, user);
  }
}

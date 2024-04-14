import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private url = 'http://localhost:8080/api/v1/users';
  constructor(private http: HttpClient) {}

  updateUser(userId: string, lastName: string): Observable<void> {
    return this.http.put<void>(`${this.url}/${userId}`, {
      lastName: lastName,
    });
  }

  changePassword(userId: string): Observable<void> {
    return this.http.put<void>(`${this.url}/${userId}/password`, {});
  }

  forgotPassword(username: string): Observable<void> {
    return this.http.put<void>(`${this.url}/${username}/forgot-password`, {});
  }
}

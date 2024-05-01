import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RetrievedUser } from '../interfaces/user/retrieveduser.model';
import { UpdatedUser } from '../interfaces/user/updateduser.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private url = 'http://localhost:8080/api/v1/users';
  constructor(private http: HttpClient) {}

  // can be accessed by HR role and admin role
  updateUser(userId: string, updatedUser: UpdatedUser): Observable<void> {
    return this.http.put<void>(`${this.url}/${userId}`, updatedUser);
  }

  // can be accessed by HR, admin and Developer roles
  changePassword(userId: string): Observable<void> {
    return this.http.put<void>(`${this.url}/${userId}/password`, {});
  }

  // can be accessed by HR, admin and Developer roles
  forgotPassword(username: string): Observable<void> {
    return this.http.put<void>(`${this.url}/${username}/forgot-password`, {});
  }

  // can be accessed by HR role and admin role
  getUserById(userId: string): Observable<RetrievedUser> {
    return this.http.get<RetrievedUser>(`${this.url}/${userId}`);
  }

  // can be accessed by HR role and admin role
  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${userId}`);
  }

  // can be accessed by HR role and admin role
  getUserByEmail(email: string): Observable<RetrievedUser> {
    return this.http.get<RetrievedUser>(`${this.url}/email?email=${email}`);
  }

  // can be accessed by HR role and admin role
  getAllUsers(): Observable<RetrievedUser[]> {
    return this.http.get<RetrievedUser[]>(`${this.url}/all`);
  }

  // can be accessed by HR role and admin role
  getAllUsersByRole(role: string): Observable<RetrievedUser[]> {
    return this.http.get<RetrievedUser[]>(`${this.url}/role?role=${role}`);
  }
}

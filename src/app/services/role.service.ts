import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { StoredUser } from '../interfaces/user/storeduser.model';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private userDataSubject = new BehaviorSubject<StoredUser | null>(
    this.getUserFromLocalStorage()
  );
  userData: StoredUser = JSON.parse(localStorage.getItem('userData') as string);
  private url = 'http://localhost:8080/api/v1/roles';
  constructor(private http: HttpClient) {}

  private getUserFromLocalStorage(): StoredUser | null {
    const userDataJson = localStorage.getItem('userData');
    return userDataJson ? JSON.parse(userDataJson) : null;
  }

  assignRole(userId: string, role: string): Observable<void> {
    return this.http.put<void>(
      `${this.url}/assign-role/${userId}?roleName=${role}`,
      {}
    );
  }

  get userInfo(): Observable<StoredUser | null> {
    return this.userDataSubject.asObservable();
  }

  isAdmin(): boolean {
    return this.userData && this.userData.role === 'admin';
  }

  isHR(): boolean {
    return this.userData && this.userData.role === 'HR';
  }

  isDeveloper(): boolean {
    return this.userData && this.userData.role === 'DEVELOPER';
  }

  isUserAdminOrHr(): boolean {
    return this.isAdmin() || this.isHR();
  }
}

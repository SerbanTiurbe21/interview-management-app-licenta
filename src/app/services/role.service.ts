import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StoredUser } from '../interfaces/user/storeduser.model';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  userData: StoredUser = JSON.parse(localStorage.getItem('userData') as string);
  private url = 'http://localhost:8080/api/v1/roles';
  constructor(private http: HttpClient) {}

  assignRole(userId: string, role: string): Observable<void> {
    return this.http.put<void>(
      `${this.url}/assign-role/${userId}?roleName=${role}`,
      {}
    );
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

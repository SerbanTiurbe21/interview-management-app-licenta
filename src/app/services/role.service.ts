import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private url = 'http://localhost:8080/api/v1/roles';
  constructor(private http: HttpClient) {}

  assignRole(userId: string, role: string): Observable<void> {
    return this.http.put<void>(
      `${this.url}/assign-role/${userId}?roleName=${role}`,
      {}
    );
  }
}

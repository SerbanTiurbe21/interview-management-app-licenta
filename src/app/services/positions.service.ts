import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Position } from '../interfaces/position.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PositionsService {
  private url = 'http://localhost:8080/api/v1/positions';
  constructor(private http: HttpClient) {}

  // can be accessed by the HR role and the admin role
  getAllPositions(): Observable<Position[]> {
    return this.http.get<Position[]>(this.url);
  }

  // can be accessed by the HR role and the admin role
  getPositionById(positionId: string): Observable<Position> {
    return this.http.get<Position>(`${this.url}/${positionId}`);
  }

  // can be accessed by the HR role and the admin role
  addPosition(position: Position): Observable<Position> {
    return this.http.post<Position>(this.url, position);
  }

  // can be accessed by the HR role and the admin role
  updatePosition(positionId: string, position: Position): Observable<Position> {
    return this.http.put<Position>(`${this.url}/${positionId}`, position);
  }

  // can be accessed by the HR role and the admin role
  cancelPosition(positionId: string): Observable<void> {
    return this.http.put<void>(`${this.url}/${positionId}/cancel`, null, {});
  }

  // can be accessed by the HR role and the admin role
  getPositionsByStatus(status: string): Observable<Position[]> {
    return this.http.get<Position[]>(`${this.url}?status=${status}`);
  }

  // can be accessed by the HR role and the admin role
  fillPosition(
    positionId: string,
    hiredCandidateId: string
  ): Observable<Position> {
    const params = new HttpParams().set('hiredCandidateId', hiredCandidateId);
    return this.http.put<Position>(`${this.url}/${positionId}/fill`, null, {
      params,
    });
  }

  // can be accessed by the HR, admin and the DEVELOPER role
  getPositionsByStatuses(
    status1: string,
    status2: string
  ): Observable<Position[]> {
    const params = new HttpParams()
      .set('status1', status1)
      .set('status2', status2);
    return this.http.get<Position[]>(`${this.url}/statuses`, { params });
  }

  // can be accessed by the HR, admin and the DEVELOPER role
  getUniquePositionNames(): Observable<string[]> {
    return this.http.get<string[]>(`${this.url}/unique`);
  }
}

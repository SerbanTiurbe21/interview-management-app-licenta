import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Candidate } from '../interfaces/candidate.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CandidatesService {
  private url = 'http://localhost:8080/api/v1/candidates';
  constructor(private http: HttpClient) {}

  // can only be accessed by the HR role
  addCandidate(candidate: Candidate): Observable<Candidate> {
    return this.http.post<Candidate>(this.url, candidate);
  }

  // can only be accessed by the HR role
  getAllCandidates(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(this.url);
  }

  // can be accessed by the HR role and the DEVELOPER role
  getCandidateById(id: string): Observable<Candidate> {
    return this.http.get<Candidate>(`${this.url}/${id}`);
  }

  // can only be accessed by the HR role
  updateCandidate(id: string, candidate: Candidate): Observable<Candidate> {
    return this.http.put<Candidate>(`${this.url}/${id}`, candidate);
  }

  // can only be accessed by the HR role
  getCandidateByPosition(position: string): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(`${this.url}?position=${position}`);
  }

  // can be accessed by the HR role and the DEVELOPER role
  getCandidateByName(name: string): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(`${this.url}?name=${name}`);
  }

  // can only be accessed by the DEVELOPER role
  getCandidatesAssignedToDeveloper(
    developerId: string
  ): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(`${this.url}/assigned/${developerId}`);
  }
}

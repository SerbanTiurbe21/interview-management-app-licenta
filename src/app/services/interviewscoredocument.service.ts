import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { InterviewScoreDocument } from '../interfaces/interviewscoredocument/interviewscoredocument.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InterviewscoredocumentService {
  private url = 'http://localhost:8080/api/v1/interview-documents';
  constructor(private http: HttpClient) {}

  // can be accessed by HR and admin roles
  createInterviewScoreDocument(
    interviewScoreDocument: InterviewScoreDocument
  ): Observable<InterviewScoreDocument> {
    return this.http.post<InterviewScoreDocument>(
      this.url,
      interviewScoreDocument
    );
  }

  // can be accessed by HR and admin roles
  getFormattedInterviewById(id: string): Observable<InterviewScoreDocument> {
    return this.http.get<InterviewScoreDocument>(`${this.url}/${id}`);
  }

  // can be accessed by HR and admin roles
  getInterviewByCandidateId(
    candidateId: string
  ): Observable<InterviewScoreDocument> {
    return this.http.get<InterviewScoreDocument>(
      `${this.url}/by-candidate-id/${candidateId}`
    );
  }

  // can be accessed by HR and admin roles
  getAllInterviews(): Observable<InterviewScoreDocument[]> {
    return this.http.get<InterviewScoreDocument[]>(this.url);
  }

  // can be accessed by HR, admin and DEVELOPER roles
  updateInterview(id: string, interviewScoreDocument: InterviewScoreDocument) {
    return this.http.put(`${this.url}/${id}`, interviewScoreDocument);
  }

  // can be accessed by HR and admin roles
  deleteInterviewById(id: string) {
    return this.http.delete(`${this.url}/${id}`);
  }
}

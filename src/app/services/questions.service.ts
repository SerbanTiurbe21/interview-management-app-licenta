import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Question } from '../interfaces/question.model';

@Injectable({
  providedIn: 'root',
})
export class QuestionsService {
  private url = 'http://localhost:8080/api/v1/questions';
  constructor(private http: HttpClient) {}

  deleteQuestion(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  addQuestion(question: Question): Observable<Question> {
    return this.http.post<Question>(this.url, question);
  }

  getQuestionsByTopicId(topicId: string): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.url}/${topicId}`);
  }

  editQuestion(id: string, question: Question): Observable<Question> {
    return this.http.put<Question>(`${this.url}/${id}`, question);
  }
}

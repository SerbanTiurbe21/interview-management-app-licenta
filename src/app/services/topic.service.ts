import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Topic } from '../interfaces/topic.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TopicService {
  private url = 'http://localhost:8080/api/v1/topics';
  constructor(private http: HttpClient) {}

  addTopic(topic: Topic): Observable<Topic> {
    return this.http.post<Topic>(this.url, topic);
  }

  displayTopics(): Observable<Topic[]> {
    return this.http.get<Topic[]>(this.url);
  }
}

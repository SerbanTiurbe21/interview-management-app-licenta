import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SectionTitle } from '../interfaces/interviewscoredocument/sectiontitle.model';

@Injectable({
  providedIn: 'root',
})
export class SectiontitleService {
  private url = 'http://localhost:8080/api/v1/section-titles';
  constructor(private http: HttpClient) {}

  // can be accessed by HR, admin and DEVELOPER roles
  createSectionTitle(sectionTitle: SectionTitle): Observable<SectionTitle> {
    return this.http.post<SectionTitle>(this.url, sectionTitle);
  }

  // can be accessed by HR, admin and DEVELOPER roles
  getAllSectionTitles(): Observable<SectionTitle[]> {
    return this.http.get<SectionTitle[]>(this.url);
  }
}

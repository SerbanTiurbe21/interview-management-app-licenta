import { Section } from './section.model';

export interface InterviewScoreDocument {
  id?: string;
  sections: Section[];
  interviewDate: string;
  lastUpdate: string;
  finalScore: number;
  roleAppliedFor: string;
  candidateId: string;
}

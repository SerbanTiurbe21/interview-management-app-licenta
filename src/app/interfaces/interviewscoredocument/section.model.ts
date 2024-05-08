import { InterviewerFeedback } from './interviewerfeedback.model';

export interface Section {
  title: string;
  interviewers: InterviewerFeedback[];
}

import { InterviewDocumentStatus } from './interviewscoredocument/interviewdocumentstatus.model';

export interface Candidate {
  id?: string;
  name: string;
  phoneNumber: string;
  cvLink: string;
  email: string;
  interviewDate: string;
  documentId: string | null;
  assignedTo: string | null;
  positionId: string | null;
  finalScore?: number;
  isHired: boolean;
  documentStatus?: InterviewDocumentStatus;
}

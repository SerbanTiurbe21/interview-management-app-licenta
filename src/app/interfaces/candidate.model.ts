export interface Candidate {
  id?: string;
  name: string;
  position: string;
  phoneNumber: string;
  cvLink: string;
  email: string;
  interviewDate: string;
  documentId: string;
  assignedTo: string | null;
}

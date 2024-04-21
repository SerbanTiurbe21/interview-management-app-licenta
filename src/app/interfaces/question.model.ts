import { Topic } from './topic.model';

export interface Question {
  id?: string;
  question: string;
  answer: string;
  topics: Topic[];
}

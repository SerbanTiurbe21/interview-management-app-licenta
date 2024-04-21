import { Component } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Question } from 'src/app/interfaces/question.model';
import { Topic } from 'src/app/interfaces/topic.model';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.css'],
})
export class QuestionsComponent {
  displayAddTopicDialog: boolean = false;
  newTopicName: string = '';
  questions: Question[] = [];
  topics: Topic[] = [];
  selectedTopic: Topic | null = null;
  currentQuestion: Question | null = null;
  isQuestionDialogVisible: boolean = false;

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadTopics();
  }

  loadTopics() {
    // Load topics from the backend
  }

  onTopicChange() {
    // Load questions for the selected topic
  }

  editQuestion(question: Question) {
    this.currentQuestion = { ...question };
    this.isQuestionDialogVisible = true;
  }

  saveQuestion() {
    // Save the question via the API
    this.isQuestionDialogVisible = false;
  }

  confirmDelete(question: Question) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this question?',
      accept: () => {
        // Delete the question
      },
    });
  }

  showAddTopicDialog() {
    this.displayAddTopicDialog = true;
  }

  saveNewTopic() {
    // Logic to save the new topic
    this.displayAddTopicDialog = false;
    this.newTopicName = ''; // Clear the input after saving
    // make an API call to save the new topic and then reload the topics and display a success message
  }

  clearNewTopic() {
    // Logic to clear the topic input
    this.newTopicName = '';
  }
}

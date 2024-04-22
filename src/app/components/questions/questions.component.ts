import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { Question } from 'src/app/interfaces/question.model';
import { Topic } from 'src/app/interfaces/topic.model';
import { QuestionsService } from 'src/app/services/questions.service';
import { TopicService } from 'src/app/services/topic.service';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.css'],
})
export class QuestionsComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  displayAddTopicDialog: boolean = false;
  newTopicName: string = '';
  questions: Question[] = [];
  topics: Topic[] = [];
  selectedTopic: Topic | null = null;
  currentQuestion: Question | null = null;
  isQuestionDialogVisible: boolean = false;

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private topicService: TopicService,
    private questionService: QuestionsService
  ) {}

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit() {
    this.loadTopics();
  }

  loadTopics() {
    this.topicService
      .displayTopics()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((topics) => {
        this.topics = topics;
      });
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
    this.displayAddTopicDialog = false;
    const addedTopic: Topic = {
      name: this.newTopicName,
    };
    this.topicService
      .addTopic(addedTopic)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Topic added successfully',
          });
          console.log('Topic added successfully');
          this.loadTopics();
        },
        error: () => {},
      });
    this.newTopicName = '';
  }

  clearNewTopic() {
    this.newTopicName = '';
  }
}

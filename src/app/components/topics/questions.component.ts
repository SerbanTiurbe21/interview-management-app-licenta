import { Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { Question } from 'src/app/interfaces/question.model';
import { Topic } from 'src/app/interfaces/topic.model';
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
    private messageService: MessageService,
    private topicService: TopicService
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

  manageQuestions(topic: Topic) {
    this.selectedTopic = topic;
    console.log('Manage questions for topic:', JSON);
  }
}

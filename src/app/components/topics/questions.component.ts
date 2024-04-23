import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
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
  topics: Topic[] = [];
  selectedTopic: Topic | null = null;
  isQuestionDialogVisible: boolean = false;

  constructor(
    private messageService: MessageService,
    private topicService: TopicService,
    private router: Router
  ) {}

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.loadTopics();
  }

  loadTopics(): void {
    this.topicService
      .displayTopics()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((topics) => {
        this.topics = topics;
      });
  }

  showAddTopicDialog(): void {
    this.displayAddTopicDialog = true;
  }

  saveNewTopic(): void {
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
        error: (error) => {
          let detail: string = 'An error occurred. Please try again later.';
          if (error instanceof HttpErrorResponse) {
            switch (error.status) {
              case 400:
                detail = 'Invalid data. Please check the input data.';
                break;
              case 401:
                detail = 'You are not authorized to perform this action.';
                break;
              case 403:
                detail = 'You are forbidden from performing this action.';
                break;
              case 404:
                detail = 'The resource was not found.';
                break;
            }
          }
          this.messageService.add({
            severity: 'error',
            summary: 'Login failed',
            detail: detail,
          });
        },
      });
    this.newTopicName = '';
  }

  clearNewTopic(): void {
    this.newTopicName = '';
  }

  manageQuestions(topic: Topic): void {
    this.selectedTopic = topic;
    this.router.navigate(['/topic/questions', topic.id]);
  }
}

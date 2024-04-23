import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { Question } from 'src/app/interfaces/question.model';
import { Topic } from 'src/app/interfaces/topic.model';
import { QuestionsService } from 'src/app/services/questions.service';
import { TopicService } from 'src/app/services/topic.service';

@Component({
  selector: 'app-realquestion',
  templateUrl: './realquestion.component.html',
  styleUrls: ['./realquestion.component.css'],
})
export class RealquestionComponent implements OnInit, OnDestroy {
  selectedTopic: Topic | null = null;
  newQuestionName: string = '';
  questionAnswer: string = '';
  displayAddQuestionDialog: boolean = false;
  displayEditQuestionDialog: boolean = false;
  editQuestionName: string = '';
  editQuestionAnswer: string = '';
  editingQuestion: Question | null = null;
  questions: Question[] = [];
  private unsubscribe$ = new Subject<void>();

  constructor(
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
    private questionService: QuestionsService,
    private topicService: TopicService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe((params) => {
      const topicId: string = params['topicId'];
      this.topicService
        .getTopicById(topicId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((topic) => {
          this.selectedTopic = topic;
        });
      this.loadQuestionsForTopic(topicId);
    });
  }

  loadQuestionsForTopic(topicId: string) {
    this.questionService
      .getQuestionsByTopicId(topicId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((questions) => {
        this.questions = questions;
      });
  }

  showAddQuestionDialog(): void {
    this.displayAddQuestionDialog = true;
  }

  saveNewQuestion(): void {
    this.displayAddQuestionDialog = false;
    const addedQuestion: Question = {
      question: this.newQuestionName,
      answer: this.questionAnswer,
      topics: [this.selectedTopic!],
    };
    this.questionService
      .addQuestion(addedQuestion)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Question added successfully',
          });
          if (this.selectedTopic?.id) {
            this.loadQuestionsForTopic(this.selectedTopic.id);
          }
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
  }

  deleteQuestion(question: Question): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this question?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.questionService
          .deleteQuestion(question.id!)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Question deleted successfully',
              });
              if (this.selectedTopic?.id) {
                this.loadQuestionsForTopic(this.selectedTopic.id);
              }
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
      },
    });
  }

  editQuestion(question: Question): void {
    this.editingQuestion = question;
    this.editQuestionName = question.question;
    this.editQuestionAnswer = question.answer;
    this.displayEditQuestionDialog = true;
  }

  saveEditedQuestion(): void {
    if (this.editingQuestion) {
      const updatedQuestion: Question = {
        ...this.editingQuestion,
        question: this.editQuestionName,
        answer: this.editQuestionAnswer,
      };

      this.questionService
        .editQuestion(this.editingQuestion.id!, updatedQuestion)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Updated',
              detail: 'Question updated successfully',
            });
            if (this.selectedTopic?.id) {
              this.loadQuestionsForTopic(this.selectedTopic?.id);
            }
            this.displayEditQuestionDialog = false;
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update the question',
            });
          },
        });
    }
  }

  goBack(): void {
    this.router.navigate(['/topics']);
  }

  clearAddQuestionDialog(): void {
    this.newQuestionName = '';
    this.questionAnswer = '';
    this.displayAddQuestionDialog = false;
  }
}

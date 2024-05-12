import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ConfirmationService,
  MenuItem,
  MessageService,
  SelectItem,
} from 'primeng/api';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { Subject, takeUntil } from 'rxjs';
import { Candidate } from 'src/app/interfaces/candidate.model';
import { InterviewDocumentStatus } from 'src/app/interfaces/interviewscoredocument/interviewdocumentstatus.model';
import { InterviewerFeedback } from 'src/app/interfaces/interviewscoredocument/interviewerfeedback.model';
import { InterviewScoreDocument } from 'src/app/interfaces/interviewscoredocument/interviewscoredocument.model';
import { Section } from 'src/app/interfaces/interviewscoredocument/section.model';
import { SectionTitle } from 'src/app/interfaces/interviewscoredocument/sectiontitle.model';
import { Position } from 'src/app/interfaces/position.model';
import { StoredUser } from 'src/app/interfaces/user/storeduser.model';
import { AuthService } from 'src/app/services/auth.service';
import { CandidatesService } from 'src/app/services/candidates.service';
import { InterviewscoredocumentService } from 'src/app/services/interviewscoredocument.service';
import { PositionsService } from 'src/app/services/positions.service';
import { RoleService } from 'src/app/services/role.service';
import { SectiontitleService } from 'src/app/services/sectiontitle.service';

@Component({
  selector: 'app-loadinterviewscoredocument',
  templateUrl: './loadinterviewscoredocument.component.html',
  styleUrls: ['./loadinterviewscoredocument.component.css'],
})
export class LoadinterviewscoredocumentComponent implements OnInit, OnDestroy {
  unsavedChanges: boolean = false;
  currentEditingSection: Section | null = null;
  displayEditSectionDialog: boolean = false;
  editSectionForm: FormGroup = new FormGroup({});
  userData: StoredUser | null = null;
  filteredSectionTitleItems: SelectItem[] = [];
  addSectionForm: FormGroup = new FormGroup({});
  displayAddSectionDialog: boolean = false;
  sections: Section[] = [];
  sectionTiles: SectionTitle[] = [];
  sectionTitleItems: SelectItem[] = [];
  interviewScoreDocumentId: string = '';
  interviewScoreDocument: InterviewScoreDocument | null = null;
  speedDialItems: MenuItem[] = [];
  isDocumentLocked: boolean = false;
  candidate: Candidate | null = null;
  candidatePosition: Position | null = null;
  isAdminOrHr: boolean = false;
  completeInterviewScoreDocument: InterviewScoreDocument | null = null;
  availableSectionTitles: SelectItem[] = [];
  private unsubscribe$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private interviewScoreDocumentService: InterviewscoredocumentService,
    private activatedRoute: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private sectionTitlesService: SectiontitleService,
    private candidatesService: CandidatesService,
    private positionService: PositionsService,
    private authService: AuthService,
    private roleService: RoleService
  ) {}

  ngOnInit(): void {
    this.getCurrentUser();
    this.activatedRoute.params.subscribe((params) => {
      this.interviewScoreDocumentId = params['id'];
      this.interviewScoreDocumentService
        .getFormattedInterviewById(this.interviewScoreDocumentId)
        .subscribe((document) => {
          this.interviewScoreDocument = document;
          this.sections = document.sections;
          this.loadAvailableSections();
          this.isDocumentLocked = document.status === 'LOCKED';
        });
    });
    this.loadCandidateData();
    this.initializeSpeedDialItems();
    this.initializeAddSectionForm();
    this.loadSectionTiles();
    this.initializeEditSectionForm();
  }

  private initializeEditSectionForm(): void {
    this.editSectionForm = this.fb.group({
      sectionName: [{ value: '', disabled: true }],
      feedback: ['', Validators.required],
      score: ['', Validators.required],
    });
  }

  private loadAvailableSections(): void {
    this.sectionTitlesService
      .getAllSectionTitles()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (titles) => {
          const userRole: string = this.userData?.role!!;
          const existingTitles = this.interviewScoreDocument?.sections.map(
            (s) => s.title
          );

          const relevantTitles = titles.filter((title) => {
            if (
              title.title.includes('General Feedback - DEV') &&
              (userRole === 'admin' || userRole === 'HR')
            ) {
              return false;
            }
            return true;
          });

          this.availableSectionTitles = relevantTitles
            .filter((title) => !existingTitles?.includes(title.title))
            .map((title) => ({ label: title.title, value: title.title }));
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'An error occurred while loading section titles',
          });
        },
      });
  }

  private getCompleteInterviewScoreDocument(): void {
    this.interviewScoreDocumentService
      .getInterviewByCandidateId(this.candidate?.id!!)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((document) => {
        this.completeInterviewScoreDocument = document;
      });
  }

  private getCurrentUser(): void {
    this.authService
      .getActiveUser()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((user) => {
        this.userData = user;
        this.isAdminOrHr = this.roleService.isUserAdminOrHr();
      });
  }

  getPositionById(positionId: string): void {
    this.positionService
      .getPositionById(positionId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((position) => {
        this.candidatePosition = position;
      });
  }

  private loadCandidateData(): void {
    this.candidatesService
      .getCandidateByDocumentId(this.interviewScoreDocumentId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((candidate) => {
        this.candidate = candidate;
        this.getPositionById(candidate?.positionId!!);
        this.getCompleteInterviewScoreDocument();
      });
  }

  private loadSectionTiles(): void {
    this.sectionTitlesService
      .getAllSectionTitles()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((sectionTitles) => {
        this.sectionTiles = sectionTitles;
        this.sectionTitleItems = sectionTitles.map((section) => {
          return {
            label: section.title,
            value: section.title,
          };
        });
      });
  }

  private initializeAddSectionForm(): void {
    this.addSectionForm = this.fb.group({
      sectionName: ['', Validators.required],
      feedback: ['', Validators.required],
      score: ['', Validators.required],
    });
  }

  filterSection(event: AutoCompleteCompleteEvent): void {
    let filtered: SelectItem[] = [];
    let query = event.query;

    for (let i = 0; i < this.availableSectionTitles.length; i++) {
      let section = this.availableSectionTitles[i];
      if (section?.label?.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(section);
      }
    }
    this.filteredSectionTitleItems = filtered;
  }

  fetchDocument() {
    this.interviewScoreDocumentService
      .getFormattedInterviewById(this.interviewScoreDocumentId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((document) => {
        this.interviewScoreDocument = document;
        this.initializeSpeedDialItems();
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  goBack(): void {
    if (
      this.interviewScoreDocument?.status !== 'LOCKED' &&
      this.unsavedChanges
    ) {
      this.confirmationService.confirm({
        message:
          'Are you sure you want to leave this page? All unsaved changes will be lost.<br>Please hit the + button and then press the save icon to save your changes.',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.router.navigate(['/candidates']);
        },
      });
      return;
    }
    this.router.navigate(['/candidates']);
  }

  private initializeSpeedDialItems(): void {
    this.speedDialItems = [
      {
        label: 'Save Sections',
        icon: 'pi pi-save',
        command: () => {
          this.saveSections();
        },
        visible: this.interviewScoreDocument?.status !== 'LOCKED',
      },
      {
        label: 'Lock Document',
        icon: 'pi pi-lock',
        command: () => {
          console.log;
          this.confirmationService.confirm({
            message: 'Are you sure you want to lock this document?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
              this.interviewScoreDocumentService
                .closeInterviewById(this.completeInterviewScoreDocument?.id!!)
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe({
                  next: () => {
                    this.messageService.add({
                      severity: 'success',
                      summary: 'Success',
                      detail: 'Document locked successfully',
                    });
                    this.isDocumentLocked = true;
                    this.fetchDocument();
                  },
                  error: (error) => {
                    let detail = 'An error occurred. Please try again later.';
                    if (error instanceof HttpErrorResponse) {
                      console.error('Error adding candidate:', error.message);
                      switch (error.status) {
                        case 400:
                          detail = error.error.message;
                          break;
                        case 401:
                          detail =
                            'You are not authorized to perform this action.';
                          break;
                        case 403:
                          detail =
                            'You are forbidden from performing this action.';
                          break;
                        case 404:
                          detail = 'The resource was not found.';
                          break;
                        case 409:
                          detail = 'The position already exists.';
                          break;
                        case 500:
                          detail =
                            'Cannot lock the document without feedback from both an HR and a Developer';
                          break;
                      }
                    }
                    this.messageService.add({
                      severity: 'error',
                      summary: 'Failed to add candidate',
                      detail: detail,
                    });
                  },
                });
            },
          });
        },
        visible: this.interviewScoreDocument?.status !== 'LOCKED',
      },
    ];
  }

  showAddSectionDialog(): void {
    this.displayAddSectionDialog = true;
  }

  resetAddSectionDialog(): void {
    this.addSectionForm.reset();
    this.displayAddSectionDialog = false;
  }

  editSection(section: Section): void {
    this.currentEditingSection = section;
    this.editSectionForm.patchValue({
      sectionName: section.title,
      feedback: section.interviewers[0].feedback,
      score: section.interviewers[0].score,
    });
    this.displayEditSectionDialog = true;
  }

  resetFormToInitial(): void {
    if (this.currentEditingSection) {
      this.editSectionForm.patchValue({
        secionName: this.currentEditingSection.title,
        feedback: this.currentEditingSection.interviewers[0].feedback,
        score: this.currentEditingSection.interviewers[0].score,
      });
    }
  }

  deleteSection(section: Section): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this section?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const index: number = this.sections.indexOf(section);
        this.sections.splice(index, 1);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Section deleted successfully!',
        });
        this.loadAvailableSections();
      },
    });
  }

  saveSection(): void {
    if (this.addSectionForm.valid) {
      const interviewerName: string = `${this.userData?.firstName} ${this.userData?.lastName}`;
      const interviewerRole: string = this.userData?.role || '';
      const interviewers: InterviewerFeedback[] = [
        {
          name: interviewerName,
          role: interviewerRole,
          feedback: this.addSectionForm.get('feedback')?.value,
          score: this.addSectionForm.get('score')?.value,
        },
      ];
      const section: Section = {
        title: this.addSectionForm.get('sectionName')?.value?.value,
        interviewers: interviewers,
      };
      this.sections.push(section);
      this.unsavedChanges = true;

      this.resetAddSectionDialog();
      this.loadAvailableSections();
    }
  }

  saveSections(): void {
    const numberOfSections: number = this.sections.length;
    let totalScore: number = 0;
    this.sections.forEach((section) => {
      section.interviewers.forEach((interviewer) => {
        totalScore += interviewer.score;
      });
    });

    if (numberOfSections > 0) {
      const finalScore: number = totalScore / numberOfSections;
      const positionName: string = this.candidatePosition?.name!!;
      const interviewDate: string =
        this.candidate?.interviewDate || new Date().toISOString();
      const lastUpdate: string = new Date().toISOString();

      const interviewScoreDocument: InterviewScoreDocument = {
        sections: this.sections,
        interviewDate: interviewDate,
        lastUpdate: lastUpdate,
        finalScore: finalScore,
        roleAppliedFor: positionName,
        candidateId: this.candidate?.id!!,
        status: InterviewDocumentStatus.EDITED,
      };

      this.confirmationService.confirm({
        message: 'Are you sure you want to save the score document?',
        accept: () => {
          this.interviewScoreDocumentService
            .updateInterview(
              this.completeInterviewScoreDocument?.id!!,
              interviewScoreDocument
            )
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
              next: () => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Success',
                  detail: 'Interview score document updated successfully',
                });
                setTimeout(() => {
                  this.router.navigate(['/candidates']);
                }, 2000);
              },
              error: (error) => {
                console.error(
                  'Error updating interview score document:',
                  error
                );
                let detail = 'An error occurred. Please try again later.';
                if (error instanceof HttpErrorResponse) {
                  console.error('Error adding candidate:', error.message);
                  switch (error.status) {
                    case 400:
                      detail = error.error.message;
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
                  summary: 'Failed to update interview score document',
                  detail: detail,
                });
              },
            });
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please add at least one section to save the score document',
      });
    }
  }

  resetEditSectionDialog(): void {
    this.editSectionForm.reset();
    this.displayEditSectionDialog = false;
  }

  saveUpdatedSection(): void {
    if (this.editSectionForm.valid) {
      const interviewerName: string = `${this.userData?.firstName} ${this.userData?.lastName}`;
      const interviewerRole: string = this.userData?.role!!;
      const interviewers: InterviewerFeedback[] = [
        {
          name: interviewerName,
          role: interviewerRole,
          feedback: this.editSectionForm.get('feedback')?.value,
          score: this.editSectionForm.get('score')?.value,
        },
      ];
      const section: Section = {
        title: this.editSectionForm.get('sectionName')?.value,
        interviewers: interviewers,
      };
      const index: number = this.sections.findIndex(
        (s) => s.title === section.title
      );
      this.sections[index] = section;
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Section updated successfully!',
      });
      this.resetEditSectionDialog();
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill in all the required fields',
      });
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  confirmExit(event: BeforeUnloadEvent): void {
    if (this.unsavedChanges) {
      event.returnValue = true;
      event.preventDefault();
    }
  }
}

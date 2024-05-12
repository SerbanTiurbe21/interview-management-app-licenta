import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
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
  selector: 'app-createinterviewscoredocument',
  templateUrl: './createinterviewscoredocument.component.html',
  styleUrls: ['./createinterviewscoredocument.component.css'],
})
export class CreateinterviewscoredocumentComponent
  implements OnInit, OnDestroy
{
  unsavedChanges: boolean = false;
  sectionTitles: SectionTitle[] = [];
  sectionTitleItems: SelectItem[] = [];
  filteredSectionTitleItems: SelectItem[] = [];
  selectedSection: string = '';
  isAdminOrHr: boolean = false;
  userData: StoredUser | null = null;
  sections: Section[] = [];
  displayAddSectionDialog: boolean = false;
  addSectionForm: FormGroup = new FormGroup({});
  private unsubscribe$ = new Subject<void>();
  candidateId: string = '';
  candidate: Candidate | null = null;
  candidatePosition: Position | null = null;
  displayEditSectionDialog: boolean = false;
  editSectionForm: FormGroup = new FormGroup({});
  documentLocked: boolean = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private roleService: RoleService,
    private interviewScoreDocumentService: InterviewscoredocumentService,
    private activatedRoute: ActivatedRoute,
    private candidateService: CandidatesService,
    private positionService: PositionsService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private sectionTitleService: SectiontitleService
  ) {}

  ngOnInit(): void {
    this.getCandidateIdFromRoute();
    this.loadCandidateData();
    this.getCurrentUser();
    this.initializeAddSectionForm();
    this.initializeEditSectionForm();
    this.initializeSectionTitles();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getCurrentUser(): void {
    this.authService
      .getActiveUser()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((user) => {
        this.userData = user;
        this.isAdminOrHr = this.roleService.isUserAdminOrHr();
      });
  }

  private initializeSectionTitles(): void {
    this.sectionTitleService
      .getAllSectionTitles()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((sectionTitles) => {
        this.sectionTitles = sectionTitles.filter(
          (title) => !title.title.includes('General Feedback')
        );

        if (this.isAdminOrHr) {
          this.sectionTitles.push({ title: 'General Feedback - HR' });
        } else {
          this.sectionTitles.push({ title: 'General Feedback - DEV' });
        }

        this.sectionTitleItems = this.sectionTitles.map((sectionTitle) => ({
          label: sectionTitle.title,
          value: sectionTitle.title,
        }));
      });
  }

  loadCandidateData(): void {
    this.candidateService
      .getCandidateById(this.candidateId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((candidate) => {
        this.candidate = candidate;
        this.getPositionById(candidate.positionId!!);
      });
  }

  getCandidateIdFromRoute(): void {
    this.activatedRoute.params
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((params) => {
        this.candidateId = params['candidate'];
      });
  }

  goBack(): void {
    if (this.unsavedChanges) {
      this.confirmationService.confirm({
        message:
          'Are you sure you want to leave this page? All unsaved changes will be lost.',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.router.navigate(['/candidates']);
        },
      });
    }
    this.router.navigate(['/candidates']);
  }

  getPositionById(positionId: string): void {
    this.positionService
      .getPositionById(positionId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((position) => {
        this.candidatePosition = position;
      });
  }

  private initializeAddSectionForm(): void {
    this.addSectionForm = this.fb.group({
      sectionName: ['', Validators.required],
      feedback: ['', Validators.required],
      score: ['', Validators.required],
    });
  }

  private initializeEditSectionForm(): void {
    this.editSectionForm = this.fb.group({
      sectionName: ['', Validators.required],
      feedback: ['', Validators.required],
      score: ['', Validators.required],
    });
  }

  resetAddSectionDialog(): void {
    this.addSectionForm.reset();
    this.displayAddSectionDialog = false;
  }

  showAddSectionDialog(): void {
    this.displayAddSectionDialog = true;
  }

  resetEditSectionDialog(): void {
    this.editSectionForm.reset();
    this.displayEditSectionDialog = false;
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
    }
  }

  filterSection(event: AutoCompleteCompleteEvent): void {
    let filtered: SelectItem[] = [];
    let query = event.query;

    for (let i = 0; i < this.sectionTitleItems.length; i++) {
      let section = this.sectionTitleItems[i];
      if (section?.label?.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(section);
      }
    }
    this.filteredSectionTitleItems = filtered;
  }

  saveSections(): void {
    const userRole: string = this.userData?.role!!;
    let requiredFeedbackTitle: string;

    if (userRole === 'admin' || userRole === 'HR') {
      requiredFeedbackTitle = 'General Feedback - HR';
    } else {
      requiredFeedbackTitle = 'General Feedback - DEV';
    }

    const hasRequiredGeneralFeedback = this.sections.some(
      (section) => section.title === requiredFeedbackTitle
    );

    if (this.sections.length === 0) {
      this.showMessage(
        'error',
        'Error',
        'Please add at least one section to save the score document'
      );
      return;
    } else if (!hasRequiredGeneralFeedback) {
      this.showMessage(
        'warn',
        'Missing Section',
        `Please add a "${requiredFeedbackTitle}" section before saving.`
      );
      return;
    }

    const totalScore: number = this.calculateTotalScore();
    const finalScore: number = totalScore / this.sections.length;
    const interviewScoreDocument: InterviewScoreDocument =
      this.createInterviewScoreDocument(finalScore);

    this.confirmAndSaveDocument(interviewScoreDocument);
  }

  private calculateTotalScore(): number {
    return this.sections.reduce(
      (total, section) =>
        total +
        section.interviewers.reduce(
          (sum, interviewer) => sum + interviewer.score,
          0
        ),
      0
    );
  }

  private createInterviewScoreDocument(
    finalScore: number
  ): InterviewScoreDocument {
    const positionName: string = this.candidatePosition?.name!;
    const interviewDate: string =
      this.candidate?.interviewDate || new Date().toISOString();
    const lastUpdate: string = new Date().toISOString();
    return {
      sections: this.sections,
      interviewDate: interviewDate,
      lastUpdate: lastUpdate,
      finalScore: finalScore,
      roleAppliedFor: positionName,
      candidateId: this.candidateId,
      status: InterviewDocumentStatus.NEW,
    };
  }

  private confirmAndSaveDocument(
    interviewScoreDocument: InterviewScoreDocument
  ): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to save the score document?',
      accept: () => {
        this.unsavedChanges = false;
        this.interviewScoreDocumentService
          .createInterviewScoreDocument(interviewScoreDocument)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe({
            next: (response) => this.updateCandidate(response),
            error: (error) =>
              this.handleError(error, 'Failed to create score document'),
          });
      },
    });
  }

  private updateCandidate(response: any): void {
    const updatedCandidate: Candidate = {
      id: this.candidateId,
      name: this.candidate?.name!!,
      phoneNumber: this.candidate?.phoneNumber!!,
      cvLink: this.candidate?.cvLink!!,
      email: this.candidate?.email!!,
      interviewDate: this.candidate?.interviewDate!!,
      documentId: response?.id!!,
      assignedTo: this.candidate?.assignedTo!!,
      positionId: this.candidate?.positionId!!,
    };
    this.candidateService
      .updateCandidate(this.candidateId, updatedCandidate)
      .subscribe({
        next: () => {
          this.showMessage(
            'success',
            'Success',
            'Document saved and candidate updated successfully!'
          );
          setTimeout(() => {
            this.router.navigate(['/candidates']);
          }, 2000);
        },
        error: (error) => this.handleError(error, 'Failed to update candidate'),
      });
  }

  private handleError(error: any, context: string): void {
    let detail = 'An error occurred. Please try again later.';
    if (error instanceof HttpErrorResponse) {
      console.error(error);
      detail = error.error.message!! || detail;
    }
    this.showMessage('error', context, detail);
  }

  private showMessage(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }

  editSection(section: Section): void {
    this.editSectionForm.patchValue({
      sectionName: this.sectionTitleItems.find(
        (item) => item.value === section.title
      ),
      feedback: section.interviewers[0].feedback,
      score: section.interviewers[0].score,
    });
    this.displayEditSectionDialog = true;
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
      },
    });
  }

  saveUpdatedSection(): void {
    if (this.editSectionForm.valid) {
      const interviewerName: string = `${this.userData?.firstName} ${this.userData?.lastName}`;
      const interviewerRole: string = this.userData?.role || '';
      const interviewers: InterviewerFeedback[] = [
        {
          name: interviewerName,
          role: interviewerRole,
          feedback: this.editSectionForm.get('feedback')?.value,
          score: this.editSectionForm.get('score')?.value,
        },
      ];
      const section: Section = {
        title: this.editSectionForm.get('sectionName')?.value?.value,
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

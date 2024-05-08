import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { Subject, takeUntil } from 'rxjs';
import { Candidate } from 'src/app/interfaces/candidate.model';
import { InterviewerFeedback } from 'src/app/interfaces/interviewscoredocument/interviewerfeedback.model';
import { InterviewScoreDocument } from 'src/app/interfaces/interviewscoredocument/interviewscoredocument.model';
import { Section } from 'src/app/interfaces/interviewscoredocument/section.model';
import { Position } from 'src/app/interfaces/position.model';
import { StoredUser } from 'src/app/interfaces/user/storeduser.model';
import { AuthService } from 'src/app/services/auth.service';
import { CandidatesService } from 'src/app/services/candidates.service';
import { InterviewscoredocumentService } from 'src/app/services/interviewscoredocument.service';
import { PositionsService } from 'src/app/services/positions.service';
import { RoleService } from 'src/app/services/role.service';

@Component({
  selector: 'app-createinterviewscoredocument',
  templateUrl: './createinterviewscoredocument.component.html',
  styleUrls: ['./createinterviewscoredocument.component.css'],
})
export class CreateinterviewscoredocumentComponent
  implements OnInit, OnDestroy
{
  sectionTitles: string[] = [
    'Java Comprehension',
    'Company Values',
    'Distributed Systems Understanding',
    'Integration Tests Comprehension',
    'Automation Tools',
    'Regression Testing',
    'System Design Principles',
    'Cloud Infrastructure and Services',
    'Microservices Architecture',
    'Security Best Practices',
    'Frontend Technologies',
    'Database Design and Optimization',
    'DevOps and CI/CD Pipelines',
    'Data Structures and Algorithms',
    'Performance Tuning',
    'Scalability Strategies',
    'Code Review and Quality Assurance',
    'Agile and Scrum Methodologies',
    'Problem-solving Skills',
    'Project Management',
    'Machine Learning Basics',
    'Blockchain Fundamentals',
    'IoT Concepts',
    'Big Data Technologies',
    'Mobile Development Essentials',
    'User Experience Design',
    'API Design and RESTful Services',
    'Software Development Life Cycle',
    'Business Intelligence',
    'Data Privacy and Compliance',
    'Open Source Contributions',
    'Leadership and Team Collaboration',
    'Web Development Fundamentals',
    'Backend Development Best Practices',
    'Frontend Development Best Practices',
    'Full Stack Development',
    'Data Science and Analytics',
    'Artificial Intelligence Concepts',
    'Deep Learning Basics',
    'Natural Language Processing',
    'Computer Vision Concepts',
    'Software Architecture and Design Patterns',
    'Network Programming',
    'Multithreading and Concurrency',
    'Debugging Techniques',
    'Refactoring Techniques',
    'Test-Driven Development',
    'Behavior-Driven Development',
    'Domain-Driven Design',
    'Functional Programming Concepts',
    'Object-Oriented Programming Concepts',
    'Procedural Programming Concepts',
    'Version Control Systems',
    'Software Testing Techniques',
    'Software Deployment and Distribution',
    'Software Documentation',
    'Software Licensing',
    'Software Maintenance',
    'Software Performance Optimization',
    'Software Security',
    'Software Usability',
    'Software Validation and Verification',
    'Software Quality',
    'Software Reliability',
    'Software Scalability',
    'Software Auditing',
    'Software Benchmarking',
    'Software Configuration Management',
    'Software Engineering Management',
    'Software Ergonomics',
    'Software Metrics and Measurement',
    'Software Packaging',
    'Software Process Improvement',
    'Software Project Management',
    'Software Requirements Analysis',
    'Software Reverse Engineering',
    'Software Risk Management',
    'Software Verification and Validation',
    'Software Visualization',
    'Software Walkthrough',
    'Pair Programming',
    'Code Smells and Anti-patterns',
    'Continuous Integration',
    'Continuous Delivery',
    'Continuous Deployment',
    'Cross-Platform Development',
    'Responsive Web Design',
    'Mobile-First Design',
    'Progressive Web Apps',
    'Serverless Architecture',
    'Microfrontend Architecture',
    'Monolithic Architecture',
    'Service-Oriented Architecture',
    'Event-Driven Architecture',
    'Clean Architecture',
    'Hexagonal Architecture',
    'CQRS and Event Sourcing',
    'Docker and Containerization',
    'Kubernetes and Orchestration',
    'Cloud-Native Applications',
    'Twelve-Factor Apps',
    'Design Thinking',
    'Lean Software Development',
    'Kanban Methodology',
    'Extreme Programming',
    'Crystal Methodology',
    'Feature-Driven Development',
    'Joint Application Development',
    'Rapid Application Development',
    'Spiral Model',
    'V-Model',
    'Waterfall Model',
    'Prototyping Model',
    'Incremental Model',
    'Iterative Model',
    'Agile Model',
    'Scrum Framework',
    'Kanban Framework',
    'Lean Framework',
    'Extreme Programming Framework',
    'Crystal Framework',
    'Feature-Driven Development Framework',
    'Joint Application Development Framework',
    'Rapid Application Development Framework',
    'Spiral Framework',
    'V-Framework',
    'Waterfall Framework',
    'Prototyping Framework',
    'Incremental Framework',
    'Iterative Framework',
    'Agile Framework',
    'Scrum Master',
    'Product Owner',
    'Development Team',
    'Stakeholder',
    'User Story',
    'Epic',
    'Theme',
    'Sprint',
    'Product Backlog',
    'Sprint Backlog',
    'Increment',
    'Definition of Done',
    'Burn-Down Chart',
    'Burn-Up Chart',
    'Scrum of Scrums',
    'Daily Scrum',
    'Sprint Planning',
    'Sprint Review',
    'Sprint Retrospective',
    'Product Backlog Refinement',
    'Velocity',
    'Story Points',
    'Planning Poker',
    'T-Shirt Sizes',
    'Ideal Days',
    'Hours',
    'Affinity Estimating',
    'Ordering Product Backlog',
    'DEEP',
    'Ready',
    'User Story Mapping',
    'Impact Mapping',
    'Kano Model',
    'Minimal Viable Product',
    'Minimal Marketable Feature',
    'Spike',
    'Technical Debt',
    'Product Vision',
    'Product Roadmap',
    'Release Planning',
    'Agile Testing',
    'Test-First Programming',
    'Acceptance Test-Driven Development',
    'Behavior-Driven Development',
    'Specification by Example',
    'Exploratory Testing',
    'Testing Quadrants',
    'Automated Testing',
  ];
  sectionTitleItems: SelectItem[] = this.sectionTitles.map((title) => ({
    label: title,
    value: title,
  }));
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
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadState();
    this.getCandidateIdFromRoute();
    this.loadCandidateData();
    this.getCurrentUser();
    this.initializeAddSectionForm();
    this.initializeEditSectionForm();
  }

  ngOnDestroy(): void {
    this.saveState([]);
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  saveState(sections: Section[]): void {
    const state = {
      sections: sections,
    };
    localStorage.setItem('interviewState', JSON.stringify(state));
  }

  loadState(): void {
    const state = localStorage.getItem('interviewState');
    if (state) {
      const parsedState = JSON.parse(state);
      this.sections = parsedState.sections;
    }
  }

  getCurrentUser(): void {
    this.authService
      .getActiveUser()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((user) => {
        this.userData = user;
        this.isAdminOrHr =
          this.roleService.isAdmin() || this.roleService.isHR();
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
    this.saveState([]);
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

      this.saveState(this.sections);
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
        candidateId: this.candidateId,
      };

      this.confirmationService.confirm({
        message: 'Are you sure you want to save the score document?',
        accept: () => {
          this.interviewScoreDocumentService
            .createInterviewScoreDocument(interviewScoreDocument)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
              next: (response) => {
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
                      this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail:
                          'Document saved and candidate updated successfully!',
                      });
                      setTimeout(() => {
                        this.router.navigate(['/candidates']);
                      }, 2000);
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
              error: (error) => {
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
                    case 409:
                      detail = 'The position already exists.';
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
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please add at least one section to save the score document',
      });
    }
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
        this.saveState(this.sections);
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
      this.saveState(this.sections);
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
}

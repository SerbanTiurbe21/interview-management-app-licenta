import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import {
  AutoCompleteCompleteEvent,
  AutoCompleteOnSelectEvent,
} from 'primeng/autocomplete';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subject, combineLatest, map, of, switchMap, takeUntil } from 'rxjs';
import { Candidate } from 'src/app/interfaces/candidate.model';
import { Position } from 'src/app/interfaces/position.model';
import { StoredUser } from 'src/app/interfaces/user/storeduser.model';
import { CandidatesService } from 'src/app/services/candidates.service';
import { AuthService } from 'src/app/services/auth.service';
import { PositionsService } from 'src/app/services/positions.service';
import { UserService } from 'src/app/services/user.service';
import { RetrievedUser } from 'src/app/interfaces/user/retrieveduser.model';
import { HttpErrorResponse } from '@angular/common/http';
import { PositionStatus } from 'src/app/interfaces/positionstatus.enum';
import { Router } from '@angular/router';
import { InterviewscoredocumentService } from 'src/app/services/interviewscoredocument.service';

const phoneRegex =
  /^(\+4|)?(07[0-8]{1}[0-9]{1}|02[0-9]{2}|03[0-9]{2}){1}?(\s|\.|\-)?([0-9]{3}(\s|\.|\-|)){2}$/;
const cvLinkRegex =
  /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i;
const dateRegex =
  /[1-9][0-9][0-9]{2}-([0][1-9]|[1][0-2])-([1-2][0-9]|[0][1-9]|[3][0-1])/;
const positionNameRegex = /^(.+)\s-\s(.+)$/;

@Component({
  selector: 'app-candidates',
  templateUrl: './candidates.component.html',
  styleUrls: ['./candidates.component.css'],
})
export class CandidatesComponent implements OnInit, OnDestroy {
  initialUpdateCandidateFormValues: any = {};
  allDevelopers: RetrievedUser[] = [];
  selectedCandidate: Candidate | null = null;
  editCandidateForm: FormGroup = new FormGroup({});
  selectedDeveloperId: string = '';
  filteredDevelopers: RetrievedUser[] = [];
  developers: RetrievedUser[] = [];
  today: Date | null = null;
  addCandidateForm: FormGroup = new FormGroup({});
  addPositionForm: FormGroup = new FormGroup({});
  positions: Position[] = [];
  allPositions: Position[] = [];
  displayAddCandidateDialog: boolean = false;
  displayAddPositionDialog: boolean = false;
  newCandidate: Candidate = this.createEmptyCandidate();
  userData: StoredUser | null = null;
  private unsubscribe$ = new Subject<void>();
  displayEditCandidateDialog: boolean = false;
  candidates: Candidate[] = [];
  filteredCandidates: Candidate[] = [];
  uniquePositions: SelectItem[] = [];
  filteredPositions: Position[] = [];
  addComponentDialogRef: DynamicDialogRef = new DynamicDialogRef();

  constructor(
    private candidatesService: CandidatesService,
    private fb: FormBuilder,
    private authService: AuthService,
    private positionsService: PositionsService,
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private interviewScoreDocumentService: InterviewscoredocumentService
  ) {
    this.today = new Date();
    this.today.setHours(0, 0, 0, 0);
  }

  ngOnInit(): void {
    this.initializeUserData();
    // this.initializeCandidateForm();
    // this.initializeEditCandidateForm();
    // this.initializeAddPositionForm();
    // this.retrieveOpenAndInProgressPositions();
    // this.retrieveAllPositions();
    this.loadCandidatesBasedOnRole();
    // this.loadAllDevelopers();
    // this.loadDevelopers();
    // this.loadCandidatesDocuments();
  }

  private initializeUserData(): void {
    this.authService
      .getActiveUser()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((user) => {
        this.userData = user;
        if (this.isUserAdminOrHr()) {
          this.adminOrHrSetup();
        } else {
          this.retrieveAllPositions();
        }
      });
  }

  private adminOrHrSetup(): void {
    this.initializeCandidateForm();
    this.initializeEditCandidateForm();
    this.initializeAddPositionForm();
    this.retrieveOpenAndInProgressPositions();
    this.retrieveAllPositions();
    this.loadAllDevelopers();
    this.loadDevelopers();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  initializeCandidateForm(): void {
    this.addCandidateForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(phoneRegex)]],
      cvLink: ['', [Validators.required, Validators.pattern(cvLinkRegex)]],
      interviewDate: ['', [Validators.required, Validators.pattern(dateRegex)]],
      position: ['', Validators.required],
      assignedTo: ['', Validators.required],
    });
  }

  initializeEditCandidateForm(): void {
    this.editCandidateForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(phoneRegex)]],
      cvLink: ['', [Validators.required, Validators.pattern(cvLinkRegex)]],
      interviewDate: ['', [Validators.required, Validators.pattern(dateRegex)]],
      position: ['', Validators.required],
      assignedTo: ['', Validators.required],
    });
  }

  showEditCandidateDialog(candidate: Candidate): void {
    if (!this.allDevelopers.length) {
      this.loadAllDevelopers();
    }

    this.prepareEditForm(candidate);
  }

  prepareEditForm(candidate: Candidate): void {
    this.selectedCandidate = candidate;
    const positionName = this.getPositionNameById(candidate.positionId!);
    const developerName = this.getDeveloperNameById(candidate.assignedTo!);

    this.selectedDeveloperId = candidate.assignedTo!!;

    this.editCandidateForm.setValue({
      name: candidate.name,
      email: candidate.email,
      phoneNumber: candidate.phoneNumber,
      cvLink: candidate.cvLink,
      interviewDate: candidate.interviewDate,
      position: positionName,
      assignedTo: developerName,
    });
    this.initialUpdateCandidateFormValues = this.editCandidateForm.value;
    this.displayEditCandidateDialog = true;
  }

  initializeAddPositionForm(): void {
    this.addPositionForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(positionNameRegex)]],
      status: [PositionStatus.OPEN, Validators.required],
    });
  }

  retrieveOpenAndInProgressPositions(): void {
    combineLatest([
      this.positionsService.getPositionsByStatus(PositionStatus.OPEN),
      this.positionsService.getPositionsByStatus(PositionStatus.IN_PROGRESS),
    ])
      .pipe(
        takeUntil(this.unsubscribe$),
        map(([openPositions, inProgressPositions]) => {
          return [...openPositions, ...inProgressPositions];
        })
      )
      .subscribe((combinedPositions) => {
        this.positions = combinedPositions;
        this.filteredPositions = combinedPositions;
      });
  }

  retrieveAllPositions(): void {
    this.positionsService
      .getAllPositions()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((positions) => {
        this.allPositions = positions;
      });
  }

  createEmptyCandidate(): Candidate {
    return {
      name: '',
      phoneNumber: '',
      cvLink: '',
      email: '',
      interviewDate: '',
      documentId: null,
      assignedTo: null,
      positionId: null,
    };
  }

  showAddCandidateDialog(): void {
    this.displayAddCandidateDialog = true;
  }

  loadCandidatesBasedOnRole(): void {
    if (this.isUserAdminOrHr() === true) {
      this.getAllCandidates();
    } else {
      this.getCandidatesAssignedToDeveloper();
    }
  }

  isUserAdminOrHr(): boolean {
    if (this.userData?.role === 'admin' || this.userData?.role === 'HR') {
      return true;
    }
    return false;
  }

  editCandidate(candidate: Candidate): void {
    this.selectedCandidate = candidate;
    this.showEditCandidateDialog(candidate);
  }

  getDeveloperNameById(id: string): string {
    const developer = this.allDevelopers.find((dev) => dev.id === id);
    return developer
      ? `${developer.firstName} ${developer.lastName}`
      : 'Unknown Developer';
  }

  getPositionIdByName(name: string): string {
    const position = this.allPositions.find((pos) => pos.name === name);
    return position ? position.id! : '';
  }

  hasFormChanged(): boolean {
    return (
      !this.editCandidateForm.pristine &&
      JSON.stringify(this.initialUpdateCandidateFormValues) !==
        JSON.stringify(this.editCandidateForm.value)
    );
  }

  updateCandidate(): void {
    if (
      this.editCandidateForm.valid &&
      this.selectedCandidate &&
      this.hasFormChanged()
    ) {
      const newDeveloperId: string =
        this.editCandidateForm.get('assignedTo')?.value.id;
      const newPositionId: string = this.getPositionIdByName(
        this.editCandidateForm.get('position')?.value
      );

      const updatedCandidate: Candidate = {
        id: this.selectedCandidate.id,
        name: this.editCandidateForm.get('name')?.value,
        phoneNumber: this.editCandidateForm.get('phoneNumber')?.value,
        cvLink: this.editCandidateForm.get('cvLink')?.value,
        email: this.editCandidateForm.get('email')?.value,
        interviewDate: this.editCandidateForm.get('interviewDate')?.value,
        documentId: this.selectedCandidate.documentId,
        assignedTo: newDeveloperId,
        positionId: newPositionId,
      };

      this.candidatesService
        .updateCandidate(this.selectedCandidate.id!, updatedCandidate)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Update Successful',
              detail: 'Candidate updated successfully!',
            });
            this.displayEditCandidateDialog = false;
            this.loadCandidatesBasedOnRole();
            this.editCandidateForm.reset();
          },
          error: (error) => {
            let detail = 'An error occurred. Please try again later.';
            if (error instanceof HttpErrorResponse) {
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
                default:
                  detail = 'Unexpected error occurred.';
                  break;
              }
            }
            this.messageService.add({
              severity: 'error',
              summary: 'Failed to Update Candidate',
              detail: detail,
            });
          },
        });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please check the form fields.',
      });
    }
  }

  confirmDeleteCandidate(candidate: Candidate): void {
    this.confirmationService.confirm({
      message:
        'Are you sure you want to delete this candidate and all associated data?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (candidate.id && candidate.positionId) {
          const updatedPosition: Position = {
            ...this.positions.find(
              (position) => position.id === candidate.positionId
            ),
            status: PositionStatus.OPEN,
            name: this.getPositionNameById(candidate.positionId),
          };

          this.candidatesService
            .deleteCandidate(candidate.id)
            .pipe(
              switchMap(() => {
                if (candidate.documentId) {
                  return this.interviewScoreDocumentService.deleteInterviewById(
                    candidate.documentId
                  );
                }
                return of(null);
              }),
              switchMap(() =>
                this.candidatesService.getCandidateByPositionId(
                  candidate.positionId!!
                )
              ),
              switchMap((remainingCandidates) => {
                if (remainingCandidates.length === 0) {
                  return this.positionsService.updatePosition(
                    candidate.positionId!!,
                    updatedPosition
                  );
                }
                return of(null);
              }),
              switchMap(() =>
                this.positionsService.getPositionsByStatuses(
                  'OPEN',
                  'IN_PROGRESS'
                )
              ),
              takeUntil(this.unsubscribe$)
            )
            .subscribe({
              next: (positions) => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Success',
                  detail:
                    'Candidate deleted successfully! Position updated as needed.',
                });
                this.positions = positions;
                this.loadCandidatesBasedOnRole();
                this.loadDevelopers();
              },
              error: (error) => {
                let detail = 'An error occurred. Please try again later.';
                if (error instanceof HttpErrorResponse) {
                  switch (error.status) {
                    case 401:
                      detail = 'You are not authorized to perform this action.';
                      break;
                    case 403:
                      detail = 'You are forbidden from performing this action.';
                      break;
                    case 404:
                      detail = 'The resource was not found.';
                      break;
                    default:
                      detail = 'Unexpected error occurred.';
                      break;
                  }
                }
                this.messageService.add({
                  severity: 'error',
                  summary: 'Failed to delete candidate',
                  detail: detail,
                });
              },
            });
        }
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Info',
          detail: 'Delete operation cancelled!',
        });
      },
    });
  }

  getAllCandidates(): void {
    this.candidatesService
      .getAllCandidates()
      .pipe(
        takeUntil(this.unsubscribe$),
        switchMap((candidates) => {
          this.filteredCandidates = candidates;
          this.candidates = candidates;

          return this.positionsService.getAllPositions().pipe(
            takeUntil(this.unsubscribe$),
            map((positions) =>
              positions
                .map((pos) => ({
                  label: pos.name,
                  value: pos.id,
                }))
                .filter((option) =>
                  candidates.some(
                    (candidate) => candidate.positionId === option.value
                  )
                )
            )
          );
        })
      )
      .subscribe({
        next: (positionOptions) => {
          this.uniquePositions = positionOptions;
        },
        error: (error) => {
          console.error('Error fetching candidates or positions:', error);
        },
        complete: () => console.log('Position fetching completed'),
      });
  }

  getCandidatesAssignedToDeveloper(): void {
    this.candidatesService
      .getCandidatesAssignedToDeveloper(this.userData?.id!!)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((candidates) => {
        this.candidates = candidates;
      });
  }

  saveNewCandidate(): void {
    if (this.addCandidateForm.valid) {
      this.newCandidate = {
        name: this.addCandidateForm.get('name')?.value,
        phoneNumber: this.addCandidateForm.get('phoneNumber')?.value,
        cvLink: this.addCandidateForm.get('cvLink')?.value,
        email: this.addCandidateForm.get('email')?.value,
        interviewDate: this.addCandidateForm.get('interviewDate')?.value,
        documentId: null,
        assignedTo: this.selectedDeveloperId,
        positionId: this.addCandidateForm.get('position')?.value?.id,
      };

      if (this.newCandidate.positionId) {
        const updatedPosition: Position = {
          ...this.positions.find(
            (position) => position.id === this.newCandidate.positionId
          ),
          status: PositionStatus.IN_PROGRESS,
          name: this.getPositionNameById(this.newCandidate.positionId),
        };

        this.candidatesService
          .addCandidate(this.newCandidate)
          .pipe(
            switchMap((candidate) =>
              this.positionsService
                .updatePosition(this.newCandidate.positionId!, updatedPosition)
                .pipe(map(() => candidate))
            ),
            takeUntil(this.unsubscribe$)
          )
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Candidate added successfully and position updated!',
              });
              this.displayAddCandidateDialog = false;
              this.addCandidateForm.reset();
              this.loadCandidatesBasedOnRole();
              this.loadDevelopers();
              this.retrieveAllPositions();
            },
            error: (error) => {
              let detail = 'An error occurred. Please try again later.';
              if (error instanceof HttpErrorResponse) {
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
                summary: 'Failed to add candidate',
                detail: detail,
              });
            },
          });
      }
    }
  }

  onPositionFilter(positionId: string): void {
    if (positionId) {
      this.filteredCandidates = this.candidates.filter(
        (candidate) => candidate.positionId === positionId
      );
    } else {
      this.filteredCandidates = [...this.candidates];
    }
  }

  getPositionNameById(id: string): string {
    const position = this.allPositions.find((pos) => pos.id === id);
    return position ? position.name : '';
  }

  filterPosition(event: AutoCompleteCompleteEvent): void {
    this.filteredPositions = this.positions.filter(
      (position) =>
        position.name &&
        position.name.toLowerCase().includes(event.query.toLowerCase())
    );
    if (this.filteredPositions.length === 0 && event.query.trim() !== '') {
      this.filteredPositions = [
        { name: 'Add new position...', status: PositionStatus.CLOSED },
      ];
    }
  }

  onPositionSelect(event: AutoCompleteOnSelectEvent): void {
    if (event.value.name === 'Add new position...') {
      this.addCandidateForm.get('position')?.reset();
      this.displayAddPositionDialog = true;
    }
  }

  resetAddPositionForm(): void {
    this.addPositionForm.reset({
      name: '',
      status: PositionStatus.OPEN,
    });
    this.displayAddPositionDialog = false;
  }

  loadAllDevelopers(): void {
    this.userService
      .getAllUsersByRole('DEVELOPER')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (developers) => {
          this.allDevelopers = developers;
        },
        error: (error) => {
          console.error('Error loading developers:', error);
        },
      });
  }

  loadDevelopers(): void {
    combineLatest([
      this.candidatesService.getAllCandidates(),
      this.userService.getAllUsersByRole('DEVELOPER'),
    ])
      .pipe(
        map(([candidates, developers]) => {
          const assignedDeveloperIds = new Set(
            candidates.filter((c) => c.assignedTo).map((c) => c.assignedTo)
          );
          return developers.filter((dev) => !assignedDeveloperIds.has(dev.id));
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe({
        next: (developers) => {
          this.developers = developers.map((user) => {
            user.fullName = `${user.firstName} ${user.lastName}`;
            return user;
          });
        },
        error: (error) => {
          console.error('Error loading developers:', error);
        },
      });
  }

  filterDevelopers(event: AutoCompleteCompleteEvent): void {
    this.filteredDevelopers = this.developers.filter(
      (developer) =>
        developer.fullName?.toLowerCase().includes(event.query.toLowerCase()) ||
        developer.firstName
          ?.toLowerCase()
          .includes(event.query.toLowerCase()) ||
        developer.lastName?.toLowerCase().includes(event.query.toLowerCase())
    );

    if (this.filteredDevelopers.length === 0 && event.query.trim() !== '') {
      this.filteredDevelopers = [
        {
          id: '',
          username: '',
          firstName: '',
          lastName: '',
          email: '',
          enabled: false,
          emailVerified: false,
          access: {
            manageGroupMembership: false,
            view: false,
            mapRoles: false,
            impersonate: false,
            manage: false,
          },
          fullName: 'No developers found',
        },
      ];
    }
  }

  onDeveloperSelect(event: AutoCompleteOnSelectEvent): void {
    if (event.value.id) {
      this.selectedDeveloperId = event.value.id;
      this.addCandidateForm.get('assignedTo')?.setValue(event.value.fullName);
    } else {
      this.addCandidateForm.get('assignedTo')?.reset();
    }
  }

  addPosition(): void {
    if (this.addPositionForm.valid) {
      const newPosition: Position = {
        name: this.addPositionForm.get('name')?.value,
        status: PositionStatus.OPEN,
      };

      this.positionsService
        .addPosition(newPosition)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Position Added',
              detail: 'The new position was successfully added.',
            });
            this.retrieveOpenAndInProgressPositions();
            this.resetAddPositionForm();
            this.addCandidateForm.get('position')?.setValue(newPosition);
          },
          error: (error) => {
            let detail = 'An error occurred. Please try again later.';
            if (error instanceof HttpErrorResponse) {
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
              summary: 'Failed to add position',
              detail: detail,
            });
          },
        });
    }
  }

  revertChanges(): void {
    if (this.selectedCandidate && this.hasFormChanged()) {
      this.prepareEditForm(this.selectedCandidate);
    }
  }

  loadInterviewScoreDocument(documentId: string): void {
    this.router.navigate(['/load-document', documentId]);
  }

  createInterviewScoreDocument(candidate: Candidate): void {
    this.router.navigate(['create-document', { candidate: candidate.id }]);
  }
}

import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { Position } from 'src/app/interfaces/position.model';
import { PositionStatus } from 'src/app/interfaces/positionstatus.enum';
import { StoredUser } from 'src/app/interfaces/user/storeduser.model';
import { AuthService } from 'src/app/services/auth.service';
import { PositionsService } from 'src/app/services/positions.service';

const positionNameRegex = /^(.+)\s-\s(.+)$/;

@Component({
  selector: 'app-positions',
  templateUrl: './positions.component.html',
  styleUrls: ['./positions.component.css'],
})
export class PositionsComponent implements OnInit, OnDestroy {
  currentInitialValues: string = '';
  displayEditPositionDialog = false;
  currentEditingPosition: Position | null = null;
  editPositionForm: FormGroup = new FormGroup({});
  positions: Position[] = [];
  displayAddPositionDialog: boolean = false;
  userData: StoredUser | null = null;
  private unsubscribe$ = new Subject<void>();
  addPositionForm: FormGroup = new FormGroup({});
  constructor(
    private authService: AuthService,
    private positionsService: PositionsService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.getUserInformation();
    this.loadPositions();
    this.initializeAddPositionForm();
    this.initializeEditPositionForm();
  }

  initializeAddPositionForm(): void {
    this.addPositionForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(positionNameRegex)]],
      status: [PositionStatus.OPEN, Validators.required],
    });
  }

  initializeEditPositionForm(): void {
    this.editPositionForm = this.fb.group({
      positionName: [
        '',
        [Validators.required, Validators.pattern(positionNameRegex)],
      ],
    });
  }

  showEditPositionDialog(position: Position): void {
    this.currentEditingPosition = position;
    this.editPositionForm.patchValue({
      positionName: position.name,
    });
    this.currentInitialValues = this.editPositionForm.value;
    this.displayEditPositionDialog = true;
  }

  resetEditPositionForm(): void {
    this.editPositionForm.reset({
      positionName: '',
    });
    this.displayEditPositionDialog = false;
  }

  resetAddPositionForm(): void {
    this.addPositionForm.reset({
      name: '',
      status: PositionStatus.OPEN,
    });
    this.displayAddPositionDialog = false;
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
            this.displayAddPositionDialog = false;
            this.resetAddPositionForm();
            this.loadPositions();
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
    }
  }

  getUserInformation(): void {
    this.authService
      .getActiveUser()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((user) => {
        this.userData = user;
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  isUserAdminOrHr(): boolean {
    if (this.userData?.role === 'admin' || this.userData?.role === 'HR') {
      return true;
    }
    return false;
  }

  showAddPositionDialog(): void {
    this.displayAddPositionDialog = true;
  }

  loadPositions(): void {
    this.positionsService
      .getAllPositions()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((positions) => {
        this.positions = positions;
      });
  }

  editPosition(position: Position): void {
    this.currentEditingPosition = position;
    this.showEditPositionDialog(position);
  }

  confirmDeactivatePosition(position: Position): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to deactivate ${position.name}?`,
      header: 'Deactivate Position',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.positionsService
          .cancelPosition(position.id!)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: `${position.name} has been deactivated.`,
              });
              this.loadPositions();
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
      },
    });
  }

  getStatusIcon(status: string, subStatus?: string): string {
    if (status === 'OPEN') {
      return 'pi-circle-on'; // Example: PrimeIcons CIRCLE_ON represents open/active
    } else if (status === 'IN PROGRESS') {
      return 'pi-spin pi-spinner'; // Spinner icon for ongoing processes
    } else if (status === 'CLOSED') {
      if (subStatus === 'FILLED_UP') {
        return 'pi-check-circle'; // Check circle for successful completion
      } else if (subStatus === 'CANCELLED') {
        return 'pi-times-circle'; // Times circle for cancellation
      }
    }
    return ''; // Default fallback if no specific icon is needed
  }

  updatePosition(): void {
    if (this.editPositionForm.valid && this.hasFormChanged()) {
      if (this.currentEditingPosition) {
        const updatedPosition: Position = {
          id: this.currentEditingPosition?.id,
          name: this.editPositionForm.get('name')?.value,
          status: this.currentEditingPosition?.status,
          subStatus: this.currentEditingPosition?.subStatus,
        };
        this.positionsService
          .updatePosition(updatedPosition.id!, updatedPosition)
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Position Updated',
                detail: 'The position has been successfully updated.',
              });
              this.displayEditPositionDialog = false;
              this.loadPositions();
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

  hasFormChanged(): boolean {
    return (
      JSON.stringify(this.currentInitialValues) !==
      JSON.stringify(this.editPositionForm.value)
    );
  }
}

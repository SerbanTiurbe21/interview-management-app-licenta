import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { RetrievedUser } from 'src/app/interfaces/user/retrieveduser.model';
import { StoredUser } from 'src/app/interfaces/user/storeduser.model';
import { UpdatedUser } from 'src/app/interfaces/user/updateduser.model';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { roleValidator } from 'src/app/shared/roleValidator.directive';

@Component({
  selector: 'app-usermanagement',
  templateUrl: './usermanagement.component.html',
  styleUrls: ['./usermanagement.component.css'],
})
export class UsermanagementComponent implements OnInit, OnDestroy {
  currentUserEditingId: string = '';
  userData: StoredUser | null = null;
  userForm: FormGroup = new FormGroup({});
  displayEditUserDialog: boolean = false;
  private unsubscribe$ = new Subject<void>();
  users: RetrievedUser[] = [];

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.authService
      .getActiveUser()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((user) => {
        this.userData = user;
      });
    this.loadUsers();
  }

  initializeForm(): void {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      role: ['', [Validators.required, roleValidator()]],
    });

    if (this.userForm) {
      const usernameControl = this.userForm.get('username');
      const emailControl = this.userForm.get('email');

      if (usernameControl) {
        usernameControl.valueChanges.subscribe((value) => {
          usernameControl.setValue(value, { emitEvent: false });
          emailControl?.setValue(value, { emitEvent: false });
        });
      }

      if (emailControl) {
        emailControl.valueChanges.subscribe((value) => {
          emailControl.setValue(value, { emitEvent: false });
          usernameControl?.setValue(value, { emitEvent: false });
        });
      }
    }
  }

  loadUsers(): void {
    this.userService
      .getAllUsers()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((users) => {
        this.users = this.prioritizeCurrentUser(users);
      });
  }

  prioritizeCurrentUser(users: RetrievedUser[]): RetrievedUser[] {
    const index: number = users.findIndex(
      (user) => user.email === this.userData?.email
    );
    if (index > -1) {
      const currentUser: RetrievedUser = users.splice(index, 1)[0];
      users.unshift(currentUser);
    }
    return users;
  }

  editUser(user: RetrievedUser): void {
    this.currentUserEditingId = user.id;
    this.userForm.reset();
    this.userForm.patchValue({
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    });

    // Admins can edit any profile, HR can only edit developers
    if (
      this.userData?.role === 'admin' ||
      (this.userData?.role === 'HR' && user.role === 'DEVELOPER')
    ) {
      this.userForm.enable();

      // Admins cannot edit their own username and email
      if (this.userData?.role === 'admin' && this.userData?.id === user.id) {
        this.userForm.get('username')?.disable();
        this.userForm.get('email')?.disable();
      }

      // HR cannot edit their own username and email, but can edit DEVELOPERs
      if (this.userData?.role === 'HR' && this.userData?.id === user.id) {
        this.userForm.get('username')?.disable();
        this.userForm.get('email')?.disable();
      }

      // Non-admins cannot edit the role
      if (this.userData?.role !== 'admin') {
        this.userForm.get('role')?.disable();
      }

      this.displayEditUserDialog = true;
    } else {
      this.userForm.disable();
      this.displayEditUserDialog = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Unauthorized',
        detail: 'You do not have permission to edit this user.',
      });
    }
  }

  saveUser(): void {
    if (this.userForm.valid) {
      const user: UpdatedUser = {
        username: this.userForm.get('username')?.value,
        email: this.userForm.get('email')?.value,
        firstName: this.userForm.get('firstName')?.value,
        lastName: this.userForm.get('lastName')?.value,
        role: this.userForm.get('role')?.value,
      };
      this.userService
        .updateUser(this.currentUserEditingId, user)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'User updated successfully!',
            });
            this.displayEditUserDialog = false;
            this.loadUsers();
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
  }

  deleteUser(user: RetrievedUser): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this user?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.userService
          .deleteUser(user.id)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'User deleted successfully!',
              });
              this.loadUsers();
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
}

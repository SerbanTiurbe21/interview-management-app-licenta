import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { StoredUser } from 'src/app/interfaces/user/storeduser.model';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-userprofile',
  templateUrl: './userprofile.component.html',
  styleUrls: ['./userprofile.component.css'],
})
export class UserprofileComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  private unsubscribe$ = new Subject<void>();
  private initialFormValues: any;
  storedUser: StoredUser | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private msgService: MessageService
  ) {
    this.loginForm = this.fb.group({
      email: new FormControl({ value: '', disabled: true }),
      firstName: new FormControl({ value: '', disabled: true }),
      lastName: new FormControl(
        { value: '', disabled: false },
        Validators.required
      ),
      role: new FormControl({ value: '', disabled: true }),
    });
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
        this.storedUser = user;
        this.loginForm.patchValue({
          email: user?.email,
          firstName: user?.firstName,
          lastName: user?.lastName,
          role: 'Not implemented yet',
        });
        this.initialFormValues = this.loginForm.value;
      });
  }

  isFormChanged(): boolean {
    return (
      JSON.stringify(this.initialFormValues) !==
      JSON.stringify(this.loginForm.value)
    );
  }

  updateUser(): void {
    if (this.loginForm.valid && this.isFormChanged()) {
      const updatedLastName: string = this.loginForm.get('lastName')?.value;
      this.authService.updateActiveUserLastName(updatedLastName);
      this.userService
        .updateUser(this.storedUser!.id, updatedLastName)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: () => {
            this.msgService.add({
              severity: 'success',
              summary: 'User updated',
              detail: 'User updated successfully',
            });
          },
          error: (error: HttpErrorResponse) => {
            let detail: string = 'An error occurred. Please try again later.';
            if (error instanceof HttpErrorResponse) {
              switch (error.status) {
                case 400:
                  detail = 'Invalid first name or last name';
                  break;
                case 401:
                  detail = 'You are not authorized to access this resource';
                  break;
                case 405:
                  detail = 'Method not allowed';
                  break;
                case 500:
                  detail = 'An error occurred. Please try again later.';
                  break;
                default:
                  detail = 'An error occurred. Please try again later.';
                  break;
              }
            }
            this.msgService.add({
              severity: 'error',
              summary: 'Login failed',
              detail: detail,
            });
          },
          complete: () => {},
        });
    }
  }

  changePassword(): void {
    alert('Not implemented yet');
  }

  forgotPassword(): void {
    alert('Not implemented yet2');
  }
}

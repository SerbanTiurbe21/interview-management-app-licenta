import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import { StoredUser } from 'src/app/interfaces/user/storeduser.model';
import { AuthService } from 'src/app/services/auth.service';
import { GeneralinformationComponent } from '../generalinformation/generalinformation.component';
import { UserService } from 'src/app/services/user.service';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-userprofile',
  templateUrl: './userprofile.component.html',
  styleUrls: ['./userprofile.component.css'],
})
export class UserprofileComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  private unsubscribe$ = new Subject<void>();
  userData: StoredUser | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private dialogService: DialogService,
    private userService: UserService,
    private messageService: MessageService
  ) {
    this.loginForm = this.fb.group({
      email: new FormControl(''),
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      role: new FormControl(''),
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
        this.userData = user;
        this.loginForm.patchValue({
          email: user?.email,
          firstName: user?.firstName,
          lastName: user?.lastName,
          role: user?.role,
        });
      });
  }

  changePassword(): void {
    const ref: DynamicDialogRef = this.dialogService.open(
      GeneralinformationComponent,
      {
        header: 'Change Password',
        width: '20%',
        data: {
          message:
            'You will receive a link in your email to change your password!',
        },
      }
    );

    ref.onClose.pipe(takeUntil(this.unsubscribe$)).subscribe((result) => {
      console.log('Dialog closed with result:', result);
      if (this.userData?.id) {
        this.userService
          .changePassword(this.userData?.id)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe({
            next: () => {
              console.log('Password reset email sent!');
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Password reset email sent!',
              });
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
    });
  }
}

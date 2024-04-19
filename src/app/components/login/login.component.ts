import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { AuthResponse } from 'src/app/interfaces/authresponse.model';
import { RetrievedUser } from 'src/app/interfaces/user/retrieveduser.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnDestroy {
  private unsubscribe$ = new Subject<void>();
  retrievedUser: RetrievedUser | null = null;
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    rememberMe: [false],
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private msgService: MessageService
  ) {
    this.initializeForm();
  }

  private initializeForm(): void {
    const rememberedEmail = localStorage.getItem('rememberMe');
    this.loginForm = this.fb.group({
      email: [rememberedEmail || '', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [!!rememberedEmail],
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  get email() {
    return this.loginForm.controls['email'];
  }
  get password() {
    return this.loginForm.controls['password'];
  }

  loginUser(): void {
    if (this.loginForm.valid) {
      const { email, password, rememberMe } = this.loginForm.value;
      this.authService
        .getUserByEmail(email as String)
        .pipe(
          takeUntil(this.unsubscribe$),
          switchMap((user: RetrievedUser) => {
            this.retrievedUser = user;
            return this.authService.login(email as String, password as String);
          })
        )
        .subscribe({
          next: (authResponse: AuthResponse) => {
            this.msgService.add({
              severity: 'success',
              summary: 'Login successful',
              detail: 'You are now logged in!',
            });
            this.authService.storeUserInformation(
              authResponse,
              this.retrievedUser!
            );
            if (rememberMe) {
              localStorage.setItem('rememberMe', email!);
            } else {
              localStorage.removeItem('rememberMe');
            }
            setTimeout(() => {
              this.router.navigate(['/home']);
            }, 500);
          },
          error: (error) => {
            let detail: string = 'An error occurred. Please try again later.';
            if (error instanceof HttpErrorResponse) {
              switch (error.status) {
                case 400:
                  detail = 'Invalid email or password';
                  break;
                case 401:
                  detail = 'You are not authorized to access this resource';
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
        });
    }
  }

  forgotPassword(): void {
    const email = this.loginForm.get('email')?.value;
    if (email) {
      this.authService
        .forgotPassword(email)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: () => {
            this.msgService.add({
              severity: 'info',
              summary: 'Reset Link Sent',
              detail:
                'If an account exists with the email provided, you will receive a password reset link.',
            });
          },
          error: (error) => {
            let detail: string = 'An error occurred. Please try again later.';
            if (error instanceof HttpErrorResponse) {
              switch (error.status) {
                case 400:
                  detail = 'Invalid email or password';
                  break;
                case 401:
                  detail = 'You are not authorized to access this resource';
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
        });
    } else {
      this.msgService.add({
        severity: 'error',
        summary: 'Forgot password failed',
        detail: 'Please enter your email address to reset your password.',
      });
    }
  }
}

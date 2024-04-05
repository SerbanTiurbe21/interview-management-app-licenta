import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Observable, Subject, switchMap, takeUntil } from 'rxjs';
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
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private msgService: MessageService
  ) {}

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
      const { email, password } = this.loginForm.value;
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
            console.log('Authentication successful:', authResponse);
            this.msgService.add({
              severity: 'success',
              summary: 'Login successful',
              detail: 'You are now logged in!',
            });
            this.authService.storeUserInformation(
              authResponse,
              this.retrievedUser!
            );
            setTimeout(() => {
              this.router.navigate(['/home']);
            }, 2000);
          },
          error: (error) => {
            console.error('Error occurred:', error);
            let detail: string = 'An error occurred. Please try again later.';
            if (error instanceof HttpErrorResponse) {
              switch (error.status) {
                case 400:
                  detail = 'Invalid email or password';
                  break;
                case 401:
                  detail = 'Unauthorized';
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
}

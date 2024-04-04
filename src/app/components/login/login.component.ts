import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { AuthResponse } from 'src/app/interfaces/authresponse.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnDestroy {
  private unsubscribe$ = new Subject<void>();
  // authObserver$: Observable<AuthResponse> = new Observable<AuthResponse>();
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

      // Check if the user exists
      this.authService
        .getUserByEmail(email as String)
        .pipe(
          takeUntil(this.unsubscribe$),
          switchMap(() => {
            return this.authService.login(email as String, password as String);
          })
        )
        .subscribe({
          next: (authResponse: AuthResponse) => {
            // update the route in the gateway and the microservices and check if it works
            // recreate the jar and then docker-compose up -d
            console.log('Authentication successful:', authResponse);
            this.msgService.add({
              severity: 'success',
              summary: 'Login successful',
              detail: 'You are now logged in!',
            });
            setTimeout(() => {
              this.router.navigate(['/home']);
            }, 2000);
          },
          error: (error) => {
            console.error('Error occurred:', error);
            this.msgService.add({
              severity: 'error',
              summary: 'Login failed',
              detail: 'Invalid email or password',
            });
          },
        });
    }
  }
}

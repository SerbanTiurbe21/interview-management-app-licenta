import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { User } from 'src/app/interfaces/user/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { passwordMatchValidator } from 'src/app/shared/password-match.directive';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnDestroy {
  private unsubscribe$ = new Subject<void>();
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  registerForm = this.fb.group(
    {
      fullName: [
        '',
        [Validators.required, Validators.pattern(/^[a-zA-Z]+(?: [a-zA-Z]+)*$/)],
      ],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{8,}$/
          ),
        ],
      ],
      confirmPassword: ['', Validators.required],
    },
    {
      validators: passwordMatchValidator,
    }
  );

  get fullName() {
    return this.registerForm.controls['fullName'];
  }

  get email() {
    return this.registerForm.controls['email'];
  }

  get password() {
    return this.registerForm.controls['password'];
  }

  get confirmPassword() {
    return this.registerForm.controls['confirmPassword'];
  }

  submitDetails(): void {
    if (this.registerForm.valid) {
      const { fullName, email, password } = this.registerForm.value;
      let [lastName, ...firstNameArr] = fullName!.split(' ');
      let firstName = firstNameArr.join(' ') || 'DefaultLastName';

      const user: User = {
        username: email,
        email: email!,
        firstName: firstName,
        lastName: lastName,
        password: password!,
      };

      console.log(JSON.stringify(user));
      this.authService
        .register(user)
        .pipe()
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Register successfully',
            });
            this.router.navigate(['/login']);
          },
          error: (error) => {
            let detail = 'Something went wrong';
            if (error instanceof HttpErrorResponse) {
              switch (error.status) {
                case 400:
                  detail = 'Invalid request. Please check your data.';
                  break;
                case 404:
                  detail = 'Resource not found.';
                  break;
                case 409:
                  detail = 'An account with this email already exists.';
                  break;
                case 422:
                  detail = 'Unprocessable entity. Please check your data.';
                  break;
              }
            }
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: detail,
            });
          },
          complete: () => {
            console.log('Request completed successfully');
          },
        });
    }
  }
}

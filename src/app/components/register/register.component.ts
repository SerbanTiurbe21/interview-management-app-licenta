import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { Role } from 'src/app/interfaces/role.model';
import { RetrievedUser } from 'src/app/interfaces/user/retrieveduser.model';
import { User } from 'src/app/interfaces/user/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { RoleService } from 'src/app/services/role.service';
import { passwordMatchValidator } from 'src/app/shared/password-match.directive';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnDestroy {
  private unsubscribe$ = new Subject<void>();

  roles: Role[] = [
    { name: 'HR', key: 'H' },
    { name: 'DEVELOPER', key: 'D' },
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router,
    private roleService: RoleService
  ) {}

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  registerForm = this.fb.group(
    {
      fullName: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Z]+ [a-zA-Z]+(-[a-zA-Z]+)?$/),
        ],
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
      selectedRole: new FormControl(),
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
      const selectedRole: Role = this.registerForm.get('selectedRole')?.value;
      let [firstName, ...lastNameArr] = fullName!.split(' ');
      let lastName = lastNameArr.join(' ') || 'DefaultLastName';

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
        .pipe(
          takeUntil(this.unsubscribe$),
          switchMap(() => {
            return this.authService.getUserByEmail(email as string);
          }),
          switchMap((retrievedUser: RetrievedUser) => {
            return this.roleService.assignRole(
              retrievedUser.id,
              selectedRole.name
            );
          })
        )
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Registration Successful',
              detail:
                'Please check your email to confirm your account before logging in.',
            });
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
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

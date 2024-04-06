import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { RetrievedUser } from 'src/app/interfaces/user/retrieveduser.model';

@Component({
  selector: 'app-userprofile',
  templateUrl: './userprofile.component.html',
  styleUrls: ['./userprofile.component.css'],
})
export class UserprofileComponent {
  constructor(private fb: FormBuilder) {}

  loginForm = this.fb.group({});
  user: RetrievedUser | null = null;

  updateUser(): void {}
}

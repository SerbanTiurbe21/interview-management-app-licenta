import { Component, OnInit } from '@angular/core';
import { InactivityService } from './services/inactivity.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'interview-management-app';
  constructor(
    private inactivityService: InactivityService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const inactivityDuration = 7200000;
    this.inactivityService
      .trackInactivity(inactivityDuration)
      .subscribe((inactive) => {
        if (inactive) {
          this.authService.logout();
        }
      });
  }
}

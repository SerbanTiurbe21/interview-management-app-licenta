import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { StoredUser } from 'src/app/interfaces/user/storeduser.model';
import { AuthService } from 'src/app/services/auth.service';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  items: MenuItem[] = [];
  private authSub: Subscription = new Subscription();
  private unsubscribe$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.authSub = this.authService
      .getActiveUser()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((user) => {
        this.setupMenu(user);
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  setupMenu(user: StoredUser | null): void {
    this.items = [
      {
        label: 'Home',
        icon: 'pi pi-fw pi-home',
        command: () => {
          this.router.navigate(['/home']);
        },
      },
      {
        label: 'Profile',
        icon: 'pi pi-fw pi-user',
        items: [
          { label: 'Verify Email', icon: 'pi pi-check-circle' },
          { label: 'Delete', icon: 'pi pi-fw pi-trash' },
          { label: 'Forgot Password', icon: 'pi pi-fw pi-refresh' },
          { label: 'Update Password', icon: 'pi pi-fw pi-pencil' },
        ],
      },
      {
        label: 'Theme',
        icon: 'pi pi-fw pi-palette',
        items: [
          {
            label: 'Light Mode',
            icon: 'pi pi-fw pi-sun',
            command: () => {
              this.themeService.switchTheme('lara-light-blue');
            },
          },
          {
            label: 'Dark Mode',
            icon: 'pi pi-fw pi-moon',
            command: () => {
              this.themeService.switchTheme('bootstrap4-dark-blue');
            },
          },
        ],
      },
      user
        ? {
            label: 'Logout',
            command: () => this.authService.logout(),
          }
        : {
            label: 'Login',
            command: () => {
              this.router.navigate(['/login']);
            },
          },
    ];
  }
}

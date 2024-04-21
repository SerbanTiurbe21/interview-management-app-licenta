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
  storedUser: StoredUser | null = null;

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
        this.storedUser = user;
        this.setupMenu(user);
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  toggleTheme(): void {
    const currentTheme = this.themeService.getActiveTheme();
    if (currentTheme && currentTheme.includes('dark')) {
      this.themeService.switchTheme('lara-light-blue');
    }
    if (currentTheme && currentTheme.includes('light')) {
      this.themeService.switchTheme('bootstrap4-dark-blue');
    }
    this.setupMenu(this.storedUser);
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
    ];

    if (user) {
      this.items.push(
        {
          label: 'Interview Management',
          icon: 'pi pi-fw pi-briefcase',
          items: [
            {
              label: 'Candidates',
              icon: 'pi pi-fw pi-user',
            },
            {
              label: 'Questions',
              icon: 'pi pi-fw pi-question',
            },
          ],
        },
        {
          label: 'Profile',
          icon: 'pi pi-fw pi-user',
          command: () => {
            this.router.navigate(['/profile']);
          },
        }
      );
      this.addThemeItem();
      this.items.push({
        label: 'Logout',
        icon: 'pi pi-fw pi-sign-out',
        command: () => this.authService.logout(),
      });
    } else {
      this.items.push({
        label: 'Login',
        icon: 'pi pi-fw pi-sign-in',
        command: () => {
          this.router.navigate(['/login']);
        },
      });
    }

    if (!user) {
      this.items.push({
        label: 'Register',
        icon: 'pi pi-fw pi-user-plus',
        command: () => {
          this.router.navigate(['/register']);
        },
      });
      this.addThemeItem();
    }
  }

  private addThemeItem(): void {
    const activeTheme = this.themeService.getActiveTheme();
    const isLightMode = activeTheme && activeTheme.includes('light');

    this.items.push({
      label: isLightMode ? 'Dark Mode' : 'Light Mode',
      icon: isLightMode ? 'pi pi-fw pi-moon' : 'pi pi-fw pi-sun',
      command: () => this.toggleTheme(),
    });
  }
}

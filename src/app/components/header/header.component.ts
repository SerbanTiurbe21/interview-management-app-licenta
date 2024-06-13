import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Subject, of, switchMap, takeUntil, tap } from 'rxjs';
import { StoredUser } from 'src/app/interfaces/user/storeduser.model';
import { AuthService } from 'src/app/services/auth.service';
import { RoleService } from 'src/app/services/role.service';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  activeUser: StoredUser | null = null;
  items: MenuItem[] = [];
  private unsubscribe$ = new Subject<void>();
  storedUser: StoredUser | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.authService
      .watchUser()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((user) => {
        this.activeUser = user;
        this.setupMenu(this.activeUser);
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
    // this.setupMenu(this.storedUser);
  }

  setupMenu(user: StoredUser | null): void {
    this.items = [
      {
        label: 'Home',
        icon: 'pi pi-fw pi-home',
        command: () => this.router.navigate(['/home']),
      },
    ];

    if (user) {
      const interviewItems: MenuItem[] = [
        {
          label: 'Candidates',
          icon: 'pi pi-fw pi-user',
          command: () => this.router.navigate(['/candidates']),
        },
        {
          label: 'Topics and Questions',
          icon: 'pi pi-fw pi-question',
          command: () => this.router.navigate(['/topics']),
        },
        {
          label: 'Positions',
          icon: 'pi pi-fw pi-briefcase',
          command: () => this.router.navigate(['/positions']),
        },
      ];

      if (this.activeUser?.role === 'admin') {
        interviewItems.push({
          label: 'User Management',
          icon: 'pi pi-fw pi-users',
          command: () => this.router.navigate(['/users']),
        });
      }

      this.items.push({
        label: 'Interview Management',
        icon: 'pi pi-fw pi-briefcase',
        items: interviewItems,
      });

      this.addThemeItem();
      this.items.push({
        label: 'Account',
        icon: 'pi pi-fw pi-user',
        items: [
          {
            label: 'Profile',
            icon: 'pi pi-fw pi-user',
            command: () => this.router.navigate(['/profile']),
          },
          {
            label: 'Logout',
            icon: 'pi pi-fw pi-sign-out',
            command: () => this.authService.logout(),
          },
        ],
      });
    } else {
      this.items.push({
        label: 'Login',
        icon: 'pi pi-fw pi-sign-in',
        command: () => this.router.navigate(['/login']),
      });
      this.items.push({
        label: 'Register',
        icon: 'pi pi-fw pi-user-plus',
        command: () => this.router.navigate(['/register']),
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

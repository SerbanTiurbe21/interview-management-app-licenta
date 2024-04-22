import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { canActivate } from './guards/auth.guard';
import { UserprofileComponent } from './components/userprofile/userprofile.component';
import { QuestionsComponent } from './components/topics/questions.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [canActivate],
  },
  {
    path: 'profile',
    component: UserprofileComponent,
    canActivate: [canActivate],
  },
  {
    path: 'topics',
    component: QuestionsComponent,
    canActivate: [canActivate],
  },
  {
    path: '', // or '**' for 404 page
    redirectTo: 'home',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

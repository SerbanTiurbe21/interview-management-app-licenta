import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { canActivate } from './guards/auth.guard';
import { UserprofileComponent } from './components/userprofile/userprofile.component';
import { QuestionsComponent } from './components/topics/questions.component';
import { RealquestionComponent } from './components/realquestion/realquestion.component';
import { PagenotfoundComponent } from './components/pagenotfound/pagenotfound.component';
import { CandidatesComponent } from './components/candidates/candidates.component';
import { UsermanagementComponent } from './components/usermanagement/usermanagement.component';
import { PositionsComponent } from './components/positions/positions.component';
import { LoadinterviewscoredocumentComponent } from './components/loadinterviewscoredocument/loadinterviewscoredocument.component';
import { CreateinterviewscoredocumentComponent } from './components/createinterviewscoredocument/createinterviewscoredocument.component';

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
    path: 'topic/questions/:topicId',
    component: RealquestionComponent,
    canActivate: [canActivate],
  },
  {
    path: 'candidates',
    component: CandidatesComponent,
    canActivate: [canActivate],
  },
  {
    path: 'users',
    component: UsermanagementComponent,
    canActivate: [canActivate],
  },
  {
    path: 'positions',
    component: PositionsComponent,
    canActivate: [canActivate],
  },
  {
    path: 'load-document/:id',
    component: LoadinterviewscoredocumentComponent,
    canActivate: [canActivate],
  },
  {
    path: 'create-document',
    component: CreateinterviewscoredocumentComponent,
    canActivate: [canActivate],
  },
  // {
  //   path: '', // or '**' for 404 page
  //   redirectTo: 'home',
  //   pathMatch: 'full',
  // },
  {
    path: '**',
    component: PagenotfoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ToastModule } from 'primeng/toast';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { HeaderComponent } from './components/header/header.component';
import { UserprofileComponent } from './components/userprofile/userprofile.component';
import { DividerModule } from 'primeng/divider';
import { TokeninterceptorserviceService } from './interceptors/tokeninterceptor.service';
import { LogginginterceptorService } from './interceptors/logginginterceptor.service';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FormsModule } from '@angular/forms';
import { QuestionsComponent } from './components/topics/questions.component';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ListboxModule } from 'primeng/listbox';
import { ToolbarModule } from 'primeng/toolbar';
import { RealquestionComponent } from './components/realquestion/realquestion.component';
import { PagenotfoundComponent } from './components/pagenotfound/pagenotfound.component';
import { CandidatesComponent } from './components/candidates/candidates.component';
import { DropdownModule } from 'primeng/dropdown';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { UsermanagementComponent } from './components/usermanagement/usermanagement.component';
import { GeneralinformationComponent } from './components/generalinformation/generalinformation.component';
import { CalendarModule } from 'primeng/calendar';
import { PositionsComponent } from './components/positions/positions.component';
import { LoadinterviewscoredocumentComponent } from './components/loadinterviewscoredocument/loadinterviewscoredocument.component';
import { CreateinterviewscoredocumentComponent } from './components/createinterviewscoredocument/createinterviewscoredocument.component';
import { AccordionModule } from 'primeng/accordion';
import { SpeedDialModule } from 'primeng/speeddial';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    HeaderComponent,
    UserprofileComponent,
    QuestionsComponent,
    RealquestionComponent,
    PagenotfoundComponent,
    CandidatesComponent,
    UsermanagementComponent,
    GeneralinformationComponent,
    PositionsComponent,
    LoadinterviewscoredocumentComponent,
    CreateinterviewscoredocumentComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CardModule,
    InputTextModule,
    ReactiveFormsModule,
    ButtonModule,
    HttpClientModule,
    ToastModule,
    BrowserAnimationsModule,
    MenubarModule,
    DividerModule,
    CheckboxModule,
    RadioButtonModule,
    FormsModule,
    TableModule,
    DialogModule,
    ConfirmDialogModule,
    ListboxModule,
    ToolbarModule,
    DropdownModule,
    OverlayPanelModule,
    AutoCompleteModule,
    DynamicDialogModule,
    CalendarModule,
    AccordionModule,
    SpeedDialModule,
  ],
  providers: [
    MessageService,
    ConfirmationService,
    DialogService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokeninterceptorserviceService,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LogginginterceptorService,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

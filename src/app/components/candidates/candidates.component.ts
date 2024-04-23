import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Candidate } from 'src/app/interfaces/candidate.model';
import { StoredUser } from 'src/app/interfaces/user/storeduser.model';
import { CandidatesService } from 'src/app/services/candidates.service';

@Component({
  selector: 'app-candidates',
  templateUrl: './candidates.component.html',
  styleUrls: ['./candidates.component.css'],
})
export class CandidatesComponent implements OnInit, OnDestroy {
  userData: StoredUser = JSON.parse(localStorage.getItem('userData') as string);
  private unsubscribe$ = new Subject<void>();
  displayAddCandidateDialog: boolean = false;
  displayEditCandidateDialog: boolean = false;
  candidates: Candidate[] = [];

  constructor(private candidatesService: CandidatesService) {}

  ngOnInit(): void {
    this.loadCandidatesBasedOnRole();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  showAddCandidateDialog(): void {}

  loadCandidatesBasedOnRole(): void {
    if (this.isUserHR()) {
      this.getAllCandidates();
    } else {
      this.getCandidatesAssignedToDeveloper();
    }
  }

  isUserHR(): boolean {
    return this.userData && this.userData.role === 'HR';
  }

  editCandidate(candidate: Candidate): void {}

  confirmDeleteCandidate(candidate: Candidate): void {}

  getAllCandidates(): void {
    this.candidatesService
      .getAllCandidates()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((candidates) => {
        this.candidates = candidates;
      });
  }

  getCandidatesAssignedToDeveloper(): void {
    this.candidatesService
      .getCandidatesAssignedToDeveloper(
        JSON.parse(localStorage.getItem('userData') as string).id
      )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((candidates) => {
        this.candidates = candidates;
      });
  }
}

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealquestionComponent } from './realquestion.component';

describe('RealquestionComponent', () => {
  let component: RealquestionComponent;
  let fixture: ComponentFixture<RealquestionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RealquestionComponent]
    });
    fixture = TestBed.createComponent(RealquestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

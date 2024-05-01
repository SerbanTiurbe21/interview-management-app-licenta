import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralinformationComponent } from './generalinformation.component';

describe('GeneralinformationComponent', () => {
  let component: GeneralinformationComponent;
  let fixture: ComponentFixture<GeneralinformationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GeneralinformationComponent]
    });
    fixture = TestBed.createComponent(GeneralinformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

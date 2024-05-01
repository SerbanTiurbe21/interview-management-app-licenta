import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddpositionComponent } from './addposition.component';

describe('AddpositionComponent', () => {
  let component: AddpositionComponent;
  let fixture: ComponentFixture<AddpositionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddpositionComponent]
    });
    fixture = TestBed.createComponent(AddpositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

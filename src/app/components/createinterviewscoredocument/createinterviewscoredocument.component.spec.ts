import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateinterviewscoredocumentComponent } from './createinterviewscoredocument.component';

describe('CreateinterviewscoredocumentComponent', () => {
  let component: CreateinterviewscoredocumentComponent;
  let fixture: ComponentFixture<CreateinterviewscoredocumentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateinterviewscoredocumentComponent]
    });
    fixture = TestBed.createComponent(CreateinterviewscoredocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

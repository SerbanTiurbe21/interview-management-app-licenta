import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadinterviewscoredocumentComponent } from './loadinterviewscoredocument.component';

describe('LoadinterviewscoredocumentComponent', () => {
  let component: LoadinterviewscoredocumentComponent;
  let fixture: ComponentFixture<LoadinterviewscoredocumentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoadinterviewscoredocumentComponent]
    });
    fixture = TestBed.createComponent(LoadinterviewscoredocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackPaymentsComponent } from './track-payments.component';

describe('TrackPaymentsComponent', () => {
  let component: TrackPaymentsComponent;
  let fixture: ComponentFixture<TrackPaymentsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrackPaymentsComponent]
    });
    fixture = TestBed.createComponent(TrackPaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

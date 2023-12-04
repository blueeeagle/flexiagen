import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeslotComponent } from './timeslot.component';

describe('TimeslotComponent', () => {
  let component: TimeslotComponent;
  let fixture: ComponentFixture<TimeslotComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TimeslotComponent]
    });
    fixture = TestBed.createComponent(TimeslotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

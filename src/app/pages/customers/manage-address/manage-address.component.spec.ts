import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageAddressComponent } from './manage-address.component';

describe('ManageAddressComponent', () => {
  let component: ManageAddressComponent;
  let fixture: ComponentFixture<ManageAddressComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManageAddressComponent]
    });
    fixture = TestBed.createComponent(ManageAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

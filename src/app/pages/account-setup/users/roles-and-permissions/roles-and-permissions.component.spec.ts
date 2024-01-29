import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolesAndPermissionsComponent } from './roles-and-permissions.component';

describe('RolesAndPermissionsComponent', () => {
  let component: RolesAndPermissionsComponent;
  let fixture: ComponentFixture<RolesAndPermissionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RolesAndPermissionsComponent]
    });
    fixture = TestBed.createComponent(RolesAndPermissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

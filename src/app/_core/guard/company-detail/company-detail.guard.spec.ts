import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { companyDetailGuard } from './company-detail.guard';

describe('companyDetailGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => companyDetailGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});

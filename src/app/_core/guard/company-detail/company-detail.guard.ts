import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { CommonService } from '@shared/services/common/common.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class companyDetailGuard implements CanActivate {

  constructor(private service: CommonService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if(this.service.session({ "method": "get", "key": "AuthToken" })) {

      if(this.service.session({ "method": "get", "key": "CompanyId" })) {

        this.service.navigate({ "url": "/pages/dashboard" });
    
        return false;

      }

      return true;

    }

    this.service.navigate({ "url": "/auth/login" });
      
    return false;

  }
  
}
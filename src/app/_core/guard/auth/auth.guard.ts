import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private service: CommonService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const companyDetails = JSON.parse(this.service.session({ "method": "get", "key": "CompanyDetails" })) || {};

    if(_.isEmpty(this.service.session({ "method": "get", "key": "AuthToken" }))) {

      this.service.navigate({ "url": "/auth" });
    
      return false;

    } else if(_.isEmpty(companyDetails)) {

      this.service.navigate({ "url": "/auth/company-details" });
    
      return false;

    } else if(companyDetails.status == 'Pending') {

      this.service.navigate({ "url": "/auth/approval-pending" });
      
      return false;

    }
      
    return true;

  }
  
}

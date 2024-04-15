import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class companyDetailGuard implements CanActivate {

  constructor(private service: CommonService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if(this.service.session({ "method": "get", "key": "AuthToken" })) {

      let companyDetails = this.service.session({ "method": "get", "key": "CompanyDetails" });

      if(!_.isEmpty(companyDetails)) {

        if(_.get(companyDetails, 'status') == "Approved") this.service.navigate({ "url": "/pages/dashboard"});

        else if(_.get(companyDetails, 'status') == "Pending" || _.get(companyDetails, 'status') == "Rejected") this.service.navigate({ "url": "/auth/approval-pending"});

        else if(_.get(companyDetails, 'status') == "Payment Pending") this.service.navigate({ "url": "/auth/payment" });

        else this.service.navigate({ "url": "/pages/dashboard"});

        return false;

      }

      return true;

    }

    this.service.navigate({ "url": "/auth/login" });
      
    return false;

  }
  
}
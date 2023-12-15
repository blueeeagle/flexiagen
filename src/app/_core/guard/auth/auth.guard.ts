import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { CommonService } from '@shared/services/common/common.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private service: CommonService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if(!(this.service.session({ "method": "get", "key": "AuthToken" }))) {

      this.service.navigate({ "url": "/auth" });
    
      return false;

    } else if(!(this.service.session({ "method": "get", "key": "CompanyDetails" }))) {

      this.service.navigate({ "url": "/auth/company-details" });
    
      return false;

    }
      
    return true;

  }
  
}

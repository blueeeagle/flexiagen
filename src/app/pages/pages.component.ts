import { Component } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { CommonService } from '@shared/services/common/common.service';
import { LoadingService } from '@shared/services/loading/loading.service';
import * as _ from 'lodash';
import { NgxSpinnerService } from 'ngx-spinner';
import { delay } from 'rxjs';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss']
})
export class PagesComponent {

  isMenuOpen:Boolean = true;

  constructor(private service: CommonService, private _loading: LoadingService, private spinner: NgxSpinnerService, private router: Router) {

    if(this.service.session({ "method": "get", "key": "AuthToken" })) { 

      this.spinner.show();
      
      setTimeout(()=>{ 

        this.service.updateUserDetails(); 
      
      },200) 

      this.listenToLoading();
    
    }

  }

  /**
    * Listen to the loadingSub property in the LoadingService class. This drives the
    * display of the loading spinner.
  */
  listenToLoading(): void {
    let count = -1;
    this._loading.loadingSub.pipe(delay(0)) // This prevents a ExpressionChangedAfterItHasBeenCheckedError for subsequent requests
      .subscribe((loading) => {
        count++;
        if(count === 0) return;
        if(loading) this.spinner.show();
        else this.spinner.hide();
    });
  }

}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ConfirmationDialogService } from '@shared/components/confirmation-dialog/confirmation.service';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';

@Component({
  selector: 'top-navbar',
  templateUrl: './top-navbar.component.html',
  styleUrls: ['./top-navbar.component.scss']
})
export class TopNavbarComponent {

  isMenuOpen: Boolean = true;
  logoUrl: any;
  _pageTitle: any = "Dashboard";
  profileImg: any = '';
  _: any = _;

  @Input() set menuStatus(value: Boolean) { this.isMenuOpen = value }

  get menuStatus() { return this.isMenuOpen; }
  
  @Input() set pageTitle(value: any) { this._pageTitle = value }

  get pageTitle() { return this._pageTitle; }

  @Output() menuEvent: EventEmitter<Boolean> = new EventEmitter();

  constructor(public service: CommonService, private confirmationDialog: ConfirmationDialogService) { 

    this.service.userDetailsObs.subscribe((value)=>{

      if(!_.isEmpty(value)) this.profileImg = this.service.getFullImagePath({ 'imgUrl': this.service.userDetails.profileImg})
      
    });

    

  }

  logImgErrorHandling() { this.logoUrl = './assets/images/logo.png'; }

  logout() {

    this.confirmationDialog.confirm({ 
      
      type: "warn", message: 'Are you sure you want to log out?', title: 'Logout' 
    
    }).then((confirmed) => {

      if (confirmed) {

        this.service.logout();

        this.service.showToastr({ "data": { "message": "Logged out successfully.", "type": "success" } });

      }

    });

  }

}

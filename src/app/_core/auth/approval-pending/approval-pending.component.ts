import { Component } from '@angular/core';
import { CommonService } from '@shared/services/common/common.service';

@Component({
  selector: 'app-approval-pending',
  templateUrl: './approval-pending.component.html',
  styleUrls: ['./approval-pending.component.scss']
})
export class ApprovalPendingComponent {

  companyDetails: any = {};
  message: string = '';
  title: string = '';

  constructor(private service: CommonService) { 

    this.companyDetails = JSON.parse(this.service.session({ "method": "get", "key": "CompanyDetails" }));

    if(this.companyDetails?.status == 'Approved') this.service.navigate({ "url": "/pages/dashboard" });

    else if(false && this.companyDetails?.status == 'Payment Pending') this.service.navigate({ "url": "/auth/payment" });

    this.message = (this.companyDetails?.status == 'Rejected') ?  
      
      'Your account has been rejected. Please contact the support team for more information.' : 
      
      'We are reviewing your details. You will be notified once your account is approved.';

    this.title = this.companyDetails?.status == 'Rejected' ? 

      'Sorry, Your account has been not approved.' :
    
      'Your details are under review';

  }
  
  goBackToHome() {

    this.service.session({ "method": "clear" });

    this.service.navigate({ "url": "/home" });

  }

}
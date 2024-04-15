import { Component } from '@angular/core';
import { CommonService } from '@shared/services/common/common.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent {

  isLoading: boolean = false;
  appServiceChargeDet: any = {};

  constructor(public service: CommonService) { 

    console.log('PaymentComponent');

  }

  // paynow() {

  //   if(this.service.userDetails.pos && _.get(_.find(this.masterList['charges'],{ 'name': 'pos' }),'value') > 0) {

  //     const payload = {

  //       "amount": this.appServiceChargeDet.pos || 0,
        
  //       "currency": this.masterList['currencyDet']?.currencyCode || "BHD",
        
  //       "customerInfo": {
          
  //         "firstName": companyPayload?.ownerName,
          
  //         "email": this.service.userDetails.email,
          
  //       }

  //     };

  //     this.service.postService({ url: "/pg/initiatePayment", payload }).subscribe((res: any) => {
        
  //       if (res.status == "ok") {

  //         this.service.session({ "method": "set", "key": "payload", "value": JSON.stringify(companyPayload) });

  //         this.service.session({ "method": "set", "key": "formValue", "value": JSON.stringify(this.companyForm.getRawValue()) });

  //         window.location.href = res.data.url;
            
  //         this.isLoading = false;
          
  //       }

  //     },
  //       (error: any) => {

  //         this.isLoading = false;
        
  //         this.service.showToastr({ data: { message: error.error.message, type: "error" } });

  //     });      

  //   } 

  // }

}

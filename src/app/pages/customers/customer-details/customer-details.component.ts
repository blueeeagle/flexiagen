import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationDialogService } from '@shared/components/confirmation-dialog/confirmation.service';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';
import * as moment from "moment";


@Component({
  selector: 'app-customer-details',
  templateUrl: './customer-details.component.html',
  styleUrls: ['./customer-details.component.scss']
})
export class CustomerDetailsComponent {

  userSubscribe: any;
  customerList!: Array<any>;
  customerDet: any = {};
  tableColumns = ['DATE', 'ORDER ID', 'NOS', 'TYPE','METHOD','AMOUNT', 'CHARGES','TOTAL','DISCOUNT', 'FINAL', 'PAYMENT STATUS', 'ORDER STATUS', 'INVOICE'];
  _: any = _;
  totalCount: number = 0;
  moment: any = moment;

  constructor(private route: ActivatedRoute,public service: CommonService,private confirmationDialog: ConfirmationDialogService){

    // this.route.params.subscribe((params) => { 

    //   this.getCustomerList(params['customerId']);

    // });

  }

  // getCustomerList(customerId: string) {

  //   this.customerDet = {}

  //   this.service.postService({ "url": `/master/customers/${customerId}` }).subscribe((res: any) => {
      
  //     if (res.status == "ok") {

  //       this.customerDet = res.data;

  //     }
      
  //   },(error: any) => {
      
  //     this.service.showToastr({ data: { type: "error", message: error?.error?.message || "Data fetching failed" } });

  //   })

  // }

}

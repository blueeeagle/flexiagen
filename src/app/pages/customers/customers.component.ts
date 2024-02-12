import { Component } from '@angular/core';
import { ConfirmationDialogService } from '@shared/components/confirmation-dialog/confirmation.service';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';
import * as moment from "moment";

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent {

  userSubscribe: any;
  customerList!: Array<any>;
  tableColumns = ['SL#', 'NAME', 'EMAIL ID', 'MOBILE','REGISTERED ON','REGISTERED VIA', 'STATUS', 'ACTION'];
  _: any = _;
  totalCount: number = 0;
  moment: any = moment;

  constructor(public service: CommonService,private confirmationDialog: ConfirmationDialogService){}


  ngOnInit() {

    if(!_.isEmpty(this.service.companyDetails)) this.getCustomerList();

    this.userSubscribe = this.service.userDetailsObs.subscribe((data: any) => {

      if(!_.isEmpty(data)) this.getCustomerList();

    });


    this.service.setApiLoaders({ "isLoading": true, "url": ["/master/customers"] });

  }

  getCustomerList() {

    let payload = { "companyId": this.service.companyDetails._id }

    console.log(payload);    

    this.service.postService({ "url": "/master/customers", "payload": payload }).subscribe((res: any) => {
      
      if (res.status == "ok") {

        this.customerList = res.data;

        this.totalCount = res.data.totalCount;

      }
      
    },(error: any) => {
      
      this.service.showToastr({ data: { type: "error", message: error?.error?.message || "Data fetching failed" } });

    })

  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.userSubscribe.unsubscribe();
  }

}

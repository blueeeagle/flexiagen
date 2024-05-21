import { Component } from '@angular/core';
import { ConfirmationDialogService } from '@shared/components/confirmation-dialog/confirmation.service';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';
import * as moment from "moment";

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent {

  userSubscribe: any;
  customerList!: Array<any>;
  tableColumns = ['SL#', 'NAME', 'EMAIL ID', 'MOBILE','REGISTERED ON','REGISTERED VIA', 'STATUS', 'ACTION'];
  _: any = _;
  totalCount: number = 0;
  pageSize: number = 10;
  pageIndex: number = 0;
  moment: any = moment;
  searchValue: string = "";

  constructor(public service: CommonService,private confirmationDialog: ConfirmationDialogService){}


  ngOnInit() {

    if(!_.isEmpty(this.service.companyDetails)) this.getCustomerList();

    this.userSubscribe = this.service.userDetailsObs.subscribe((data: any) => {

      if(!_.isEmpty(data)) this.getCustomerList();

    });


    this.service.setApiLoaders({ "isLoading": true, "url": ["/master/customers"] });

  }

  pageChanged(event: any) {

    this.pageIndex = event.pageIndex;

    this.pageSize = event.pageSize;

    this.getCustomerList();

  }


  getCustomerList() {

    let payload = { "companyId": this.service.companyDetails._id }

    let params = { "pageIndex": this.pageIndex, "pageSize": this.pageSize, "searchValue": this.searchValue };

    this.service.postService({ "url": "/master/customers", "payload": payload, "params": params }).subscribe((res: any) => {
      
      if (res.status == "ok") {

        this.customerList = res.data;

        this.totalCount = _.size(res.data);

      }
      
    },(error: any) => {
      
      this.service.showToastr({ data: { type: "error", message: error?.error?.message || "Data fetching failed" } });

    })

  }

  showCustomerDetails(customerDet: any) {

    this.service.otherData.customerDetails = customerDet;

    this.service.navigate({ "url": `/pages/customers/details/${customerDet._id}` });

  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.userSubscribe.unsubscribe();
  }


}

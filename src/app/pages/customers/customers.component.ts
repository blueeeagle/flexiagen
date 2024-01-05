import { Component, Input, ViewChild } from '@angular/core';
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

  customerList!: Array<any>;
  tableColumns = ['SL#', 'NAME', 'EMAIL ID', 'MOBILE','REGISTERED ON','REGISTERED VIA', 'STATUS', 'ACTION'];
  _: any = _;
  totalCount: number = 0;
  moment: any = moment;

  constructor(public service: CommonService,private confirmationDialog: ConfirmationDialogService){}


  ngOnInit() {

    this.service.setApiLoaders({ "isLoading": true, "url": ["/master/customers"] });

    this.getCustomerList();
  }

  getCustomerList() {

    this.service.postService({ url: "/master/customers" }).subscribe((res: any) => {
      
      if (res.status == "ok") {

        this.customerList = res.data;

        this.totalCount = res.data.totalCount;

      }
      
    },
      (error: any) => {
      
        this.service.showToastr({ data: { type: "error", message: error?.error?.message || "Data fetching failed" } });
    })

  }

}

import { Component, ViewChild } from '@angular/core';
import { OffcanvasComponent } from '@shared/components';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';


@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent {

  @ViewChild('canvas') canvas: OffcanvasComponent | undefined;

  openCanvas : boolean = false;
  filterForm: any = {};
  orderList: any = [];
  totalCount: number = 0;
  tableColumns = ['ORDER NO', 'ORDER DATE', 'CUSTOMER NAME', 'MOBILE', 'MAIL','NOOFITEMS' ,'BOOKEDVIA','ORDER STATUS','PAYMENT STATUS','ACTION'];
  _: any = _;

  constructor(public service: CommonService, ){}

  ngOnInit() {

    this.service.setApiLoaders({ "isLoading": true, "url": ["/agent/orders"] });

    this.getOrderList();

    this.loadForm();
    
  }

  loadForm() {

    this.filterForm = this.service.fb.group({

      "orderType": [""],
      "fromDate": [""],
      "toDate": [""],
      "orderMode": [""],
      "orderStatus": [""],
      "paymentStatus": [""]

    });

  }

  getOrderList() {

    this.service.postService({ url: "/agent/orders" }).subscribe((res: any) => {
      
      if (res.status == "ok") {

        this.orderList = res.data;

        this.totalCount = res.totalCount;

      }
      
    },(error: any) => {
      
      this.service.showToastr({ data: { type: "error", message: error?.error?.message || "Data fetching failed" } });

    })
    
  }

  openAsideBar() {
    
    this.openCanvas = true;

  }

}
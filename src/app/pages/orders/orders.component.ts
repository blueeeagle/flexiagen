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
  searchValue: string = "";
  pageSize: number = 10;
  pageIndex: number = 0;
  filterValues: any = null;

  constructor(public service: CommonService, ){}

  ngOnInit() {

    this.service.setApiLoaders({ "isLoading": true, "url": ["/agent/orders"] });

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

    this.filterData();

  }

  filterData() {

    if(_.isEqual(this.filterValues, _.pickBy(this.filterForm.value))) return this.canvas?.close();

    this.filterValues = _.pickBy(this.filterForm.value);

    this.pageIndex = 0;

    this.pageSize = 10;

    this.getOrderList({});

  }

  getOrderList({ isPageChange = false }: { isPageChange?: Boolean}) {

    if(!isPageChange) {

      this.pageIndex = 0;

      this.pageSize = 10;

    }

    let params = { "pageIndex": this.pageIndex, "pageSize": this.pageSize, "searchValue": this.searchValue };

    this.service.postService({ url: "/agent/orders", "params": params, "payload": _.pickBy(this.filterForm.value) }).subscribe((res: any) => {
      
      if (res.status == "ok") {

        this.orderList = res.data;

        this.totalCount = res.totalCount;

      }

      this.canvas?.close();
      
    },(error: any) => {

      this.canvas?.close();
      
      this.service.showToastr({ data: { type: "error", message: error?.error?.message || "Data fetching failed" } });

    })
    
  }

  openAsideBar() {
    
    this.openCanvas = true;

  }

}
import { Component, ViewChild } from '@angular/core';
import { ModalComponent, OffcanvasComponent } from '@shared/components';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-orders-list',
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.scss']
})
export class OrdersListComponent {

  @ViewChild('canvas') canvas: OffcanvasComponent | undefined;
  @ViewChild('OrderDetailsModal') OrderDetailsModal!: ModalComponent;

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
  companyDetails : any = {} ;
  orderDetails : any = {};

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

  openModal(data: any) {

    this.companyDetails = this.service.userDetails;

    console.log(this.companyDetails);
    
    this.orderDetails = data;

    console.log(this.orderDetails);

    this.OrderDetailsModal.open();

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
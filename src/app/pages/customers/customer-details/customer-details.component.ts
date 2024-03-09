import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModalComponent } from '@shared/components';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';
import * as moment from "moment";

@Component({
  selector: 'app-customer-details',
  templateUrl: './customer-details.component.html',
  styleUrls: ['./customer-details.component.scss']
})
export class CustomerDetailsComponent {

  @ViewChild('OrderDetailsModal') OrderDetailsModal!: ModalComponent;

  userSubscribe: any;
  customerList!: Array<any>;
  customerDetails: any = {};
  tableColumns = ['ORDER NO', 'ORDER DATE', 'CUSTOMER NAME', 'MOBILE', 'NO OF ITEMS','BOOKED VIA','GROSS AMT','DISC AMT','NET AMT','PAYMENT RECEIVED','PAYMENT STATUS','ORDER STATUS','ACTION'];
  _: any = _;
  totalCount: number = 0;
  orderList: any = [];
  moment: any = moment;
  orderDetails: any = {};
  lastOrderDet: any = {};

  constructor(private router: Router, public service: CommonService) { 

    this.service.otherData.secondaryPageTitle = "Customer Details";

    if(!_.isEmpty(this.service.companyDetails)) this.checkRouteValidation();

    this.userSubscribe = this.service.userDetailsObs.subscribe((res: any) => {

      if(!_.isEmpty(res)) {

        this.checkRouteValidation();
    
      } else this.router.navigate(['/auth/login']);

    });    

  }

  checkRouteValidation() {

    if(_.isEmpty(this.service.otherData?.customerDetails)) {

      let customerId: any = this.router.url.split('/').pop();

      var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$")

      if(checkForHexRegExp.test(customerId)) { 

        this.getCustomerSummaryDetails(customerId);

      } else this.router.navigate(['/pages/customers']);

    } else {

      let customerId = this.service.otherData.customerDetails?._id;

      this.customerDetails = this.service.otherData.customerDetails;

      this.getCustomerSummaryDetails(customerId);

      this.service.setApiLoaders({ "isLoading": true, "url": ["/agent/orders","/customer/orders/summary/"+customerId] });


    }

    this.customerDetails = this.service.otherData.customerDetails;

  }

  getCustomerSummaryDetails(customerId: any) {

    this.service.getService({ 'url': "/customer/orders/summary/"+customerId }).subscribe((res: any) => {

      if(res.status == "ok") {

        this.service.otherData.customerDetails = res.data.customerDetail;

        this.customerDetails = this.service.otherData.customerDetails;

        this.customerDetails.discount = _.find(this.customerDetails.discounts, { "companyId": this.service.companyDetails?._id });

        this.lastOrderDet = res.data.lastOrderDet;

        this.getOrderDetails();

      } else this.router.navigate(['/pages/customers']);

    },(err: any) => {

      this.service.showToastr({ "data": { "type": "error", "message": err.message || "Can't get customer details" } });

      this.router.navigate(['/pages/customers']);

    });

  }

  getOrderDetails() {

    this.service.postService({ 'url': "/agent/orders", "payload": { "customerId": this.service.otherData.customerDetails?._id } }).subscribe((res: any) => {

      if(res.status == "ok") {

        this.orderList = res.data;

        this.totalCount = res.totalCount;

      }

    },(err: any) => { 

      this.service.showToastr({ "data": { "type": "error", "message": err.message || "Can't get order details" } });
      
    });

  }

  openModal(orderDet: any) {

    this.orderDetails = orderDet;

    this.OrderDetailsModal.open();

  }

  viewInfo({ purpose = 'manage-address' }: { purpose: 'manage-address' | 'manage-profile' }) {

    this.service.navigate({ "url": `/pages/customers/${purpose}/${this.customerDetails._id}` });


  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.service.otherData.customerDetails = {};
    this.service.otherData.secondaryPageTitle = '';
  }

}

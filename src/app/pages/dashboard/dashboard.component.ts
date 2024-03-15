import { Component } from '@angular/core';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

  dashboardData: any = {};
  orderDetail: any = {};
  orderNo: any = '';
  _: any = _;

  constructor(public service: CommonService) {

    this.service.setApiLoaders({ "isLoading": true, "url": ["/dashboard/agentOrders"] });

    this.getDashboardDate();

  }

  getDashboardDate() {

    this.service.getService({ url: "/dashboard/agentOrders" }).subscribe((res: any) => {

      if(res.status == 'ok') {

        this.dashboardData = res.data;

      }

    });

  }  

  checkOrderStatus() {

    if(_.size(this.orderNo) < 21) return this.service.showToastr({ data: { type: "error", message: "Please enter a valid 21 digit order number " } });

    let params = { "orderNo": this.orderNo };

    this.service.getService({ 'url': '/dashboard/checkOrderStatus', "params": params }).subscribe((res: any) => {

      if(res.status == 'ok') {

        this.orderDetail = res.data;

        this.orderNo = '';

      }

    });

  }

}

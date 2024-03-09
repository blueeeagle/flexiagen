import { Component } from '@angular/core';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent {

  totalCount: number = 0;
  tableColumns = ['DATE', 'ORDER NO', 'CUSTOMER NAME', 'MOBILE', 'TYPE','RATING', 'REVIEW'];
  _: any = _;
  searchValue: string = "";
  pageSize: number = 10;
  pageIndex: number = 0;
  reviewsList: any = [];

  constructor(public service: CommonService) {

    this.service.setApiLoaders({ "isLoading": true, "url": ["/customer/reviews"] });

    this.getCustomerReviews();

  }

  getCustomerReviews() {

    this.service.getService({ url: "/customer/reviews" }).subscribe((res: any) => {

      if(res.status == 'ok') {

        this.totalCount = res.totalCount;

        this.reviewsList = res.data;

      }

    });

  }


}

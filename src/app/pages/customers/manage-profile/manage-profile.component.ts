import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-manage-profile',
  templateUrl: './manage-profile.component.html',
  styleUrls: ['./manage-profile.component.scss']
})
export class ManageProfileComponent {

  userSubscribe: any;
  customerDetails: any = {};
  _: any = _;
  discountForm: any = {};

  constructor(private router: Router, public service: CommonService) { 

    this.service.otherData.secondaryPageTitle = "Profile Update";

    if(_.isEmpty(this.service.otherData?.customerDetails)) {

      let customerId: any = this.router.url.split('/').pop();

      var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$")

      if(checkForHexRegExp.test(customerId)) { 

        this.getCustomerDetail(customerId);

      } else this.router.navigate(['/pages/customers']);

    } else {

      let customerId = this.service.otherData.customerDetails?._id;

      this.customerDetails = this.service.otherData.customerDetails;

      this.getCustomerDetail(customerId);

      this.service.setApiLoaders({ "isLoading": true, "url": ["/master/customers"] });

    }

    this.customerDetails = this.service.otherData.customerDetails;

  }

  getCustomerDetail(customerId: any) {

    let payload = { "_id": customerId }

    this.service.postService({ 'url': "/master/customers", "payload": payload }).subscribe((res: any) => {

      if(res.status == "ok" && res.data.length > 0) {

        this.service.otherData.customerDetails = _.first(res.data);

        this.customerDetails = this.service.otherData.customerDetails;

        this.customerDetails.discount = _.filter(this.customerDetails.discounts, { 'companyId': this.service.companyDetails.companyId });

      } else this.router.navigate(['/pages/customers']);

    },(err: any) => {

      this.service.showToastr({ "data": { "type": "error", "message": err.message || "Can't get customer details" } });

      this.router.navigate(['/pages/customers']);

    });

  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.service.otherData.customerDetails = {};
    this.service.otherData.secondaryPageTitle = '';
  }

}

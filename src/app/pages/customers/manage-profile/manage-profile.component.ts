import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
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
  formSubmitted: boolean = false;

  constructor(private router: Router, public service: CommonService) { 

    this.loadForm();

    if(!_.isEmpty(this.service.companyDetails)) this.checkRouteValidation();

    this.userSubscribe = this.service.userDetailsObs.subscribe((res: any) => {

      if(!_.isEmpty(res)) {

        this.checkRouteValidation();

      } else this.router.navigate(['/auth/login']);

    });


  }

  checkRouteValidation() {

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

      this.service.setApiLoaders({ "isLoading": true, "url": ["/me","/master/customers"] });

    }

    this.customerDetails = this.service.otherData.customerDetails;

  }


  loadForm() {

    this.formSubmitted = false;

    this.discountForm = this.service.fb.group({

      "customerName": [ { 'value': this.customerDetails?.firstName + ' ' + this.customerDetails?.lastName , 'disabled': true } ],

      "email": [ { 'value': this.customerDetails?.email, 'disabled': true } ],

      "phone": [ { 'value': this.customerDetails?.dialCode + ' ' + this.customerDetails?.mobile, 'disabled': true } ],

      "customerId": [ this.customerDetails?._id ],

      "currencyId": [this.service.currencyDetails?._id ],

      "value": [ this.customerDetails?.discount?.value || "", [ Validators.required ]],

      "discType": [ this.customerDetails?.discount?.discType || "percentage" ], //"flat", "percentage"

    });

  }

  get f() { return this.discountForm.controls; }

  getCustomerDetail(customerId: any) {

    let payload = { "_id": customerId }

    this.service.postService({ 'url': "/master/customers", "payload": payload }).subscribe((res: any) => {

      if(res.status == "ok" && res.data.length > 0) {

        this.service.otherData.customerDetails = _.first(res.data);

        this.customerDetails = this.service.otherData.customerDetails;

        this.customerDetails.discount = _.find(this.customerDetails.discounts, { 'companyId': this.service.companyDetails._id });

        this.loadForm();

      } else this.router.navigate(['/pages/customers']);

    },(err: any) => {

      this.service.showToastr({ "data": { "type": "error", "message": err.message || "Can't get customer details" } });

      this.router.navigate(['/pages/customers']);

    });

  }

  saveDiscount() {

    this.formSubmitted = true;

    if(this.discountForm.invalid) return this.service.showToastr({ "data": { "type": "error", "message": "Please fill the dicount value" } });

    let payload = this.discountForm.value;

    payload['companyId'] = this.service.companyDetails._id;

    this.service.postService({ 'url': "/master/customer/discount/"+payload.customerId, "payload": payload }).subscribe((res: any) => {

      if(res.status == "ok") {

        this.service.showToastr({ "data": { "type": "success", "message": "Discount updated successfully" } });

        this.service.otherData.customerDetails = res.customerData;

        this.customerDetails = this.service.otherData.customerDetails;

        this.customerDetails.discount = _.find(this.customerDetails.discounts, { 'companyId': this.service.companyDetails.companyId });

      } else this.service.showToastr({ "data": { "type": "error", "message": res.message || "Can't update discount" } });

    },(err: any) => {

      this.service.showToastr({ "data": { "type": "error", "message": err.message || "Can't update discount" } });

    });

  }

  removeDiscount() {

    this.service.deleteService({ 'url': "/master/customer/discount/"+this.customerDetails?.discount?._id }).subscribe((res: any) => {

      if(res.status == "ok") {

        this.service.showToastr({ "data": { "type": "success", "message": "Discount removed successfully" } });

        this.service.otherData.customerDetails = res.data;

        this.customerDetails = this.service.otherData.customerDetails;

        this.customerDetails.discount = _.find(this.customerDetails.discounts, { 'companyId': this.service.companyDetails.companyId });

        this.loadForm();
 
      } else this.service.showToastr({ "data": { "type": "error", "message": res.message || "Can't remove discount" } });

    },(err: any) => {

      this.service.showToastr({ "data": { "type": "error", "message": err.message || "Can't remove discount" } });

    });

  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.userSubscribe.unsubscribe();
    this.service.otherData.customerDetails = {};
    this.service.otherData.secondaryPageTitle = '';
  }

}

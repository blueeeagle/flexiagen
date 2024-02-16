import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-create-order',
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.scss']
})
export class CreateOrderComponent {

  orderForm: any;
  customerForm: any;
  addressForm: any;
  filterForm: any;
  openCanvas: boolean = false;
  formSubmitted: any = {
    "customerForm": false,
    "orderForm": false,
    "customerSearched": false
  };
  canvasConfig: any = {
    "canvasName": "addCustomer",
    "canvasTitle": "Add Customer",
    "applyBtnTxt": "Save",
    "cancelBtnTxt": "Clear",
    "showCancelBtn": true
  };
  masterList: any = {
    "dialCodeList": [],
    "countryList": [],
    "stateList": [],
    "cityList": [],
    "areaList": [],
    "productCharges": [],
    "categoryList": [],
    "workingHours": [],
    "activeDays": []
  };
  step = 0;

  constructor(public service: CommonService) { 

    this.filterForm = this.service.fb.group({ 
      
      'categoryId': [],

      'searchValue': ''
    
    });

    this.loadForm();

    this.loadCustomerForm();

    this.loadAddressForm();

    this.getBasicDetails();

  }

  getBasicDetails() {

    forkJoin({

      "countries": this.service.getService({ "url": "/address/countries" }),

      "dialCodes": this.service.getService({ "url": "/address/dialCode" }),

      "categories": this.service.postService({ "url": "/master/categories" }),

      "charges": this.service.getService({ "url": "/master/productCharges" }),

      "workingHours": this.service.postService({ "url": "/setup/workingHrs/list", "payload": { "is_active": true } })

    }).subscribe((res: any) => {

      this.masterList["countryList"] = res.countries.status == "ok" ? res.countries.data : [];

      this.masterList["dialCodeList"] = res.dialCodes.status == "ok" ? res.dialCodes.data : [];

      this.masterList["categoryList"] = res.categories.status == "ok" ? res.categories.data : [];

      this.masterList["workingHours"] = res.workingHours.status == "ok" ? res.workingHours.data : [];

      this.masterList['activeDays'] = _.map(this.masterList['workingHours'], 'day');

      this.filterForm.patchValue({ 'categoryId': _.map(this.masterList['categoryList'], '_id') });

      // this.getMyProducts({});

      if(res.charges.status == "ok") {

        this.masterList['productCharges'] = res.charges.data;

        this.masterList['productCharges'] = _.flatten(_.map(this.masterList['productCharges'], (obj: any) => {

          obj.chargeType = 'normal';

          let obj2 = { ..._.cloneDeep(obj), chargeType: 'urgent' };
          
          return [obj, obj2];

        }));

      }

    });

  }

  loadForm() {

    this.orderForm = this.service.fb.group({

      'searchCustomer': [''],

      'customerDetails': {},

      'customerId': ['', Validators.required],

      'isExistingCustomer': [false],

      'isCustomerVerified': [false],

    });

  }

  loadCustomerForm() {

    this.customerForm = this.service.fb.group({

      'companyId': [ this.service?.companyDetails?._id, Validators.required],

      'firstName': [ null, Validators.required ],

      'lastName': [ null, Validators.required ],  

      'email': [ null, Validators.email ],

      'dialCode': [ null, [Validators.required]],

      'mobile': [ null, [Validators.required]],

      'gender': [ 'male' ],

      'customerType': 'pos',
      
    });

  }

  loadAddressForm() {

    this.addressForm = this.service.fb.group({

      'street': [ null, Validators.required ],

      'building': [ null ],

      'block': [ null ],

      'others': [ null ],

      'areaId': [ null, Validators.required ],

      'cityId': [ null, Validators.required ],

      'stateId': [ null, Validators.required ],

      'countryId': [ null, Validators.required ],

      'zipcode': [ null, Validators.required ],

      'isDefault': false

    });

  }

  get f() { return this.orderForm.controls; }

  get cusf() { return this.customerForm.controls; }

  get af() { return this.addressForm.controls; }

  searchCustomer() {
    
    // if email or phone number is empty
    if(_.isEmpty(this.f.searchCustomer.value)) { 
      return this.service.showToastr({ "data": { "message": "Please enter customer email or phone number", "type": "error" } });
    }
    // if email is invalid) // if email is invalid
    if(new RegExp('^[a-zA-Z]+$').test(this.f.searchCustomer.value) && new RegExp('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$').test(this.f.searchCustomer.value) == false) {
      return this.service.showToastr({ "data": { "message": "Please enter valid email address", "type": "error" } });
    }
    // if phone number is invalid
    if(!this.f.searchCustomer.value.includes('@') && new RegExp('^[0-9]{6,10}$').test(this.f.searchCustomer.value) == false) {
      return this.service.showToastr({ "data": { "message": "Please enter valid phone number", "type": "error" } });
    }

    let payload = this.f.searchCustomer.value.includes('@') ? { "email": this.f.searchCustomer.value } : { "mobile": this.f.searchCustomer.value };

    this.service.postService({ "url": "/master/customers", payload }).subscribe((res: any) => {

      if(res.status == 'ok') {

        if(_.isEmpty(res.data)) {

          this.formSubmitted.customerSearched = true;
          
          return this.service.showToastr({ "data": { "message": `No customer found with this ${ _.first(_.keys(payload)) == 'email' ? 'Email Id' : 'Mobile No'  } `, "type": "error" } });

        } else {

          let customerDetails: any = _.first(res.data);

          this.orderForm.patchValue({ 
            
            "customerDetails": customerDetails,

            "customerId": customerDetails._id,

            "isExistingCustomer": customerDetails.companyId.includes(this.service.userDetails.companyId),

            "isCustomerVerified": false
          
          });

        }

      }

      console.log(this.orderForm.value);

    });

  }

  asidebarCancel() {

  }

  asidebarSubmit() {

  }

}

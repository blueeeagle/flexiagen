import { Component } from '@angular/core';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-create-order',
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.scss']
})
export class CreateOrderComponent {

  orderForm: any;
  formSubmitted: any = {
    customerForm: false,
    orderForm: false,
    customerSearched: false
  };

  step = 0;

  constructor(public service: CommonService) { 

    this.loadForm();

  }

  loadForm() {

    this.orderForm = this.service.fb.group({

      'searchCustomer': [''],

    });

  }

  get f() { return this.orderForm.controls; }

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
          
          return this.service.showToastr({ "data": { "message": "No customer found with this email or phone number", "type": "error" } });

        }

      }

    });

  }

}

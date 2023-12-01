import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss']
})
export class LocationComponent {
  
  openCanvas: boolean = false;
  editData : any = {}
  formSubmitted: boolean = false;
  locationFrom: FormGroup = new FormGroup({});
  locationForm: FormGroup = new FormGroup({});

  location = [];

  constructor(public service: CommonService) { 

    this.loadForm();

    this.service.userDetailsObs.subscribe((value)=>{

      if(_.isEmpty(value)) this.loadForm();

    })

  }

  loadForm() {

    this.formSubmitted = false;

    this.locationForm = this.service.fb.group({

      "agentId": this.editData?.agentId?._id || this.service.userDetails?._id,

      "companyId": this.editData?.companyId?._id || this.service.companyDetails?._id || 0,

      "areaId": this.editData?.areaId?._id || [],

      "minOrderAmt" : this.editData?.minOrderAmt || 0,

      "isFreeDelivery":  this.editData?.isFreeDelivery || 'FREE',

      "deliveryCharge":  this.editData?.deliveryCharge || 0,
    
    });

  }

  openAsideBar(data?: any){

    this.editData = data || {};

    this.openCanvas = true

  }
  
  get f(): any { return this.locationForm.controls }

}

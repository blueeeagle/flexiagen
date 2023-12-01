import { Component } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-locationForm',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss']
})
export class LocationComponent {
  
  openCanvas: boolean = false;
  editData : any = {};
  mode: 'Create' | 'Update' = 'Create';
  formSubmitted: boolean = false;
  locationForm: FormGroup = new FormGroup({});
  masterList: any = {
    "areaList": []
  };
  locationList: Array<any> = [];
  userSubscribe: any;

  constructor(public service: CommonService) { 

    this.loadForm();

    if(!_.isEmpty(this.service.companyDetails)) this.getAreaList();

    this.userSubscribe = this.service.userDetailsObs.subscribe((value)=>{

      if(!_.isEmpty(value)) {
        
        this.loadForm();

        this.getAreaList();

      }

    })

  }

  getAreaList() {

    this.service.getService({ "url": `/address/areas/${this.service.companyDetails?.addressDetails?.cityId?._id}` }).subscribe((res: any) => {

      if(res.status=='ok') {

        this.masterList['areaList'] = res.data || [];

      }

    });

  }

  loadForm() {

    this.formSubmitted = false;

    this.locationForm = this.service.fb.group({

      "agentId": this.editData?.agentId?._id || this.service.userDetails?._id,

      "companyId": this.editData?.companyId?._id || this.service.companyDetails?._id || 0,

      "areaId": [this.mode == 'Update' ? this.editData?.areaId?._id : null, [Validators.required]],

      "minOrderAmt" : [this.editData?.minOrderAmt || null, [Validators.required]],

      "isFreeDelivery":  this.editData?.isFreeDelivery || 'FREE',

      "deliveryCharge":  [this.editData?.deliveryCharge || null, [Validators.required]],
    
    });

  }

  openAsideBar(data?: any){

    this.editData = data || {};

    this.mode = data ? 'Update' : 'Create';

    this.openCanvas = true

  }
  
  get f(): any { return this.locationForm.controls }

  submit() {

    this.formSubmitted = true;

    if(this.locationForm.invalid) return;

    let payload = this.locationForm.value;

    if(this.mode=='Create') payload = _.map(payload.areaId,(value)=>{ return _.extend(payload, { "areaId": value }) });

    // console.log(payload);

  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.userSubscribe.unsubscribe();
  }

}

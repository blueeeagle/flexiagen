import { Component, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { OffcanvasComponent } from '@shared/components';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-locationForm',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss']
})
export class LocationComponent {

  @ViewChild('canvas') canvas: OffcanvasComponent | undefined;
  
  tableColumns = ['SL#', 'LOCATION', 'MIN ORDER AMOUNT', 'DELIVERY CHARGES', 'SERVICE', 'ACTION'];
  openCanvas: boolean = false;
  editData : any = {};
  mode: 'Create' | 'Update' = 'Create';
  formSubmitted: boolean = false;
  locationForm: FormGroup = new FormGroup({});
  masterList: any = {
    "areaList": null
  };
  locationList!: Array<any>;
  userSubscribe: any;
  isLoading: boolean = false;
  _: any = _;

  loaderUrlList: any = ['/setup/agentLocations','/master/otherNewLocations/'+JSON.parse(this.service.session({ "method": "get", "key": "CompanyDetails" }))?.addressDetails?.cityId?._id];

  constructor(public service: CommonService) { 

    this.service.setApiLoaders({ 'isLoading': true, 'url': this.loaderUrlList });

    this.loadForm();

    this.getAgentLocations();

    if(!_.isEmpty(this.service.companyDetails)) this.getAreaList();

    this.userSubscribe = this.service.userDetailsObs.subscribe((value)=>{

      if(!_.isEmpty(value)) {
        
        this.loadForm();

        this.getAreaList();

      }

    });

  }

  getAgentLocations() {

    this.service.getService({ "url": `/setup/agentLocations` }).subscribe((res: any) => {

      this.locationList = res.status=='ok' ? res.data : [];

    },(error: any)=>{

      this.service.showToastr({ "data": { "message": error?.message || "Something went wrong!", "type": "error" } });

    });

  }

  getAreaList() {

    this.service.getService({ "url": `/master/otherNewLocations/${this.service.companyDetails?.addressDetails?.cityId?._id}`, "options": { "loaderState": true } }).subscribe((res: any) => {

      if(res.status=='ok') {

        this.masterList['areaList'] = res.data || [];

      }

      this.service.setApiLoaders({ 'isLoading': false, 'url': this.loaderUrlList });

    });

  }

  loadForm() {

    this.formSubmitted = false;

    this.locationForm = this.service.fb.group({

      "companyId": this.editData?.companyId || this.service.userDetails?.companyId || 0,

      "areaId": [ this.mode == 'Update' ? this.editData.areaId._id : null, [Validators.required]],

      "minOrderAmt" : [ this.mode == 'Update' ? this.editData.minOrderAmt.toCustomFixed() : null, [Validators.required]],

      "isFreeDelivery":  this.editData?.isFreeDelivery || false,

      "deliveryCharge":  [ this.mode == 'Update' ? this.editData.deliveryCharge.toCustomFixed() : null, [Validators.required]],
    
    });

    this.f.isFreeDelivery.valueChanges.subscribe((value: any) => {

      if(value) {

        this.f.deliveryCharge.clearValidators();

        this.f.deliveryCharge.setValue(null);

        this.f.deliveryCharge.disable();

      } else {
        
        this.f.deliveryCharge.setValidators([Validators.required]);

        this.f.deliveryCharge.setValue(this.editData?.deliveryCharge || null);

        this.f.deliveryCharge.enable();

      }

      this.f.deliveryCharge.updateValueAndValidity();

    });

  }

  openAsideBar(data?: any){

    if(_.isNull(this.masterList['areaList'])) 
    
      return this.service.showToastr({ "data": { "message": "Please wait while we are fetching areas!", "type": "info" } });
 
    if(_.isUndefined(data) &&_.size(this.masterList['areaList']) == 0) 
    
      return this.service.showToastr({ "data": { "message": "All areas are already added!", "type": "info" } });

    this.editData = data || {};

    this.mode = data ? 'Update' : 'Create';

    this.loadForm();
    
    this.openCanvas = true;


  }
  
  get f(): any { return this.locationForm.controls }

  updateLocation(data: any) {

    this.service.patchService({ "url": `/setup/agentLocation/${data._id}`, "payload": { "is_active": data.is_active } }).subscribe((res: any) => {
  
      if(res.status=='ok') {

        this.service.showToastr({ "data": { "message": `Location ${ data.is_active ? 'activated' : 'inactivated' } successfully!`, "type": "success" } });

        this.locationList.splice(_.findIndex(this.locationList,{ "_id": res.data._id }), 1, res.data);

      }

    });

  }

  submit() {

    this.formSubmitted = true;

    if(this.locationForm.invalid) return;

    let payload = _.cloneDeep(this.locationForm.value);

    this.isLoading = true;
    
    if(this.mode=='Create') payload = _.map(this.f.areaId.value,(value)=>{ return { ..._.omit(payload,'areaId'), "areaId": value }; });

    forkJoin({

      "result": this.mode == 'Create' ? 

          this.service.postService({ "url": '/setup/agentLocations', "payload": payload }) : 
      
            this.service.patchService({ "url": `/setup/agentLocation/${this.editData._id}` , "payload": payload })

    }).subscribe({

      next: (res: any) => {

        this.isLoading = false;

        if(res.result.status=='ok') {

          this.canvas?.close();

          this.service.showToastr({ "data": { "message": `Location ${ this.mode == 'Create' ? 'created' : 'updated' } successfully!`, "type": "success" } });

          this.getAgentLocations();

          if(this.mode == 'Create') {

            this.masterList['areaList'] = _.filter(this.masterList['areaList'],(e: any)=>!_.includes(e._id,_.map(payload,'areaId')));

          }

          this.loadForm();

        }

      }, 

      error: (err: any) => {

        this.isLoading = false;

      }

    });

  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.userSubscribe.unsubscribe();
  }

}

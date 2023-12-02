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

    this.locationList = [];

    this.service.getService({ "url": `/setup/agentLocations` }).subscribe((res: any) => {

      if(res.status=='ok') {

        this.locationList = res.data || [];

      }

    });

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

      "companyId": this.editData?.companyId || this.service.userDetails?.companyId || 0,

      "areaId": [ this.mode == 'Update' ? this.editData?.areaId?._id : null, [Validators.required]],

      "minOrderAmt" : [this.editData?.minOrderAmt || null, [Validators.required]],

      "isFreeDelivery":  this.editData?.isFreeDelivery || false,

      "deliveryCharge":  [this.editData?.deliveryCharge || null, [Validators.required]],
    
    });

  }

  openAsideBar(data?: any){

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
    
    if(this.mode=='Create') payload = _.map(this.f.areaId.value,(value)=>{ return { ..._.omit(payload,'areaId'), "areaId": value }; });

    forkJoin({

      "result": this.mode == 'Create' ? 

          this.service.postService({ "url": '/setup/agentLocations', "payload": payload }) : 
      
            this.service.patchService({ "url": `/setup/agentLocation/${this.editData._id}` , "payload": payload })

    }).subscribe({

      next: (res: any) => {

        if(res.result.status=='ok') {

          this.canvas?.close();

          this.service.showToastr({ "data": { "message": `Location ${ this.mode == 'Create' ? 'created' : 'updated' } successfully!`, "type": "success" } });

          this.getAgentLocations();

          this.loadForm();

        }

      }

    });

  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.userSubscribe.unsubscribe();
  }

}

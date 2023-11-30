import { Component } from "@angular/core";
import { FormGroup, Validators } from "@angular/forms";
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-address-details',
  templateUrl: './address-details.component.html',
  styleUrls: ['./address-details.component.scss']
})
export class AddressDetailsComponent {

  addressDetailsFrom!: FormGroup;
  formSubmitted: boolean = false;
  isLoading: boolean = false;
  masterList: any = {
    countryList: [],
    stateList: [],
    cityList: [],
    areaList: []
  };
  showPreview: boolean = false;
  _: any = _;

  constructor(public service: CommonService) { 

    this.service.userDetailsObs.subscribe((value)=>{

      if(!_.isEmpty(value)) this.loadForm();
      
    })

  }

  ngOnInit(): void {

    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.    
    
    this.loadForm();

    this.getCountries();

  }

  // Get Countries List

  getCountries() {

    this.masterList['countryList'] = [];

    this.service.getService({ "url": "/master/countries" }).subscribe((res: any) => {

      this.masterList['countryList'] = res.status=='ok' ? res.data : [];

    });

  }

  // Get States based on Country

  getStates() {

    this.masterList['stateList'] = [];

    this.service.getService({ "url": `/master/countries/${this.f.countryId.value}/states` }).subscribe((res: any) => {

      this.masterList['stateList'] = res.status=='ok' ? res.data : [];

    });

  }

  // Get Cities based on Country or State
  
  /**
   * 
   * @param fieldName // countryId or stateId
   */

  getCities({ fieldName = "countryId" }: { fieldName: 'countryId' | 'stateId' }) {

    this.masterList['cityList'] = [];

    this.service.getService({ "url": `/master/${fieldName == 'countryId' ? 'countries' : 'states' }/${this.f[fieldName].value}/cities` }).subscribe((res: any) => {

      this.masterList['cityList'] = res.status=='ok' ? res.data : [];

    });

  }  

  // Get Areas based on City

  getAreas() {

    this.service.getService({ "url": `/master/cities/${this.f.cityId.value}/areas` }).subscribe((res: any) => {

      this.masterList['areaList'] = res.status=='ok' ? res.data : [];

    });

  }

  // Initiate Company Details form

  loadForm() {

    this.formSubmitted = false;

    this.addressDetailsFrom = this.service.fb.group({

      'address1': [this.service.userDetails.address1 || '', [Validators.required]],

      'address2': [this.service.userDetails.address2 || '', [Validators.required]],

      'areaId': [this.service.userDetails.areaId?._id || null, [Validators.required]],  
      
      'cityId': [this.service.userDetails.cityId?._id || null, [Validators.required]],

      'stateId': [this.service.userDetails.stateId?._id || null],

      'countryId': [this.service.userDetails.countryId?._id || null, [Validators.required]],

      'zipcode': [this.service.userDetails.zipcode || null, [Validators.required]],

    });

    if(!_.isEmpty(this.service.userDetails)) {

      this.getStates(); // Get States based on Country
  
      this.getCities({ 'fieldName': 'stateId' }); // Get Cities based on State

      this.getAreas(); // Get Areas based on City

    }

    // Listen to Country changes and update State, City, Area and zipcode

    this.addressDetailsFrom.controls['countryId'].valueChanges.subscribe((value: any) => {

      this.masterList = {

        ...this.masterList,

        'stateList': [],

        'cityList': [],

        'areaList': []

      };

      let countryDet = _.find(this.masterList['countryList'], { '_id': value });

      console.log(countryDet);
      
      this.addressDetailsFrom.patchValue({ 
        
        'cityId': null,
        
        'stateId': null,
        
        'areaId': null,
        
        'zipcode': null
      
      }, { emitEvent: false });

      if(countryDet.hasState == 1) {

        this.addressDetailsFrom.controls['stateId'].setValidators([Validators.required]);

        this.getStates(); // Get States based on Country        

      } else this.addressDetailsFrom.controls['stateId'].setValidators([]);

      this.addressDetailsFrom.controls['stateId'].updateValueAndValidity({ emitEvent: false });

      this.getCities({ 'fieldName': 'countryId' }); // Get Cities based on Country

    });

    // Listen to State changes and update City, Area and zipcode

    this.addressDetailsFrom.controls['stateId'].valueChanges.subscribe((value: any) => {

      this.getCities({ 'fieldName': 'stateId' }); // Get Cities based on State

      this.masterList['areaList'] = []; // Reset Area List

      this.addressDetailsFrom.patchValue({ 
        
        'cityId': null,
        
        'areaId': null,
        
        'zipcode': null 
      
      }, { emitEvent: false });

    });

    // Listen to City changes and update Area and zipcode

    this.addressDetailsFrom.controls['cityId'].valueChanges.subscribe((value: any) => {

      this.getAreas(); // Get Areas based on City

      this.addressDetailsFrom.patchValue({
        
        'areaId': null, 'areaName': '',
        
        'zipcode': null 
      
      });

    });

    // Listen to Area changes

    this.addressDetailsFrom.controls['areaId'].valueChanges.subscribe((value: any) => {

      this.addressDetailsFrom.patchValue({ 
        
        'zipcode': null 
      
      });

    });

  }

  // convenience getter for easy access to form fields

  get f(): any { return this.addressDetailsFrom.controls }

  submit(): any {
    
    if(this.addressDetailsFrom.invalid) return this.formSubmitted = true;

    this.isLoading = true

    let payload: any = this.addressDetailsFrom.value;

    this.service.postService({ "url": `/users/update/${this.service.userDetails._id}`, 'payload': payload, 'options': { 'Content-Type': 'application/x-www-form-urlencoded' } }).subscribe((res: any) => {

      if(res.status=='ok') {

        this.service.showToastr({ "data": { "message": "Address Details Updated Successfully", "type": "success" } });        

        this.service.getUserDetails.subscribe((userRes: any) => {

          this.service.userDetails = userRes.data;

          this.service.userDetailsObs.next(userRes);

        });

      }

      this.isLoading = false;

    },(err: any)=>{

      this.isLoading = false;

      this.service.showToastr({ "data": { "message": _.get(err, 'error.message', 'Something went wrong'), "type": "error" } });

    });

  }


}

  

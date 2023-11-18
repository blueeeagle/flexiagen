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
  appServiceChargeDet: any = [];
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

    this.getApplicationServiceList();

  }

  // Get Application Service List

  getApplicationServiceList() {

    this.service.getService({ "url": "/master/app-commissions" }).subscribe((res: any) => {

      this.appServiceChargeDet = res.status==200 ? res.data : [];

    });

  }

  // Get Countries List

  getCountries() {

    this.masterList['countryList'] = [];

    this.service.getService({ "url": "/master/countries" }).subscribe((res: any) => {

      this.masterList['countryList'] = res.status==200 ? res.data : [];

    });

  }

  // Get States based on Country

  getStates() {

    this.masterList['stateList'] = [];

    this.service.getService({ "url": `/master/countries/${this.f.country.value}/states` }).subscribe((res: any) => {

      this.masterList['stateList'] = res.status == 200 ? res.data : [];

    });

  }

  // Get Cities based on Country or State
  
  /**
   * 
   * @param fieldName // country or state
   */

  getCities({ fieldName = "country" }: { fieldName: 'country' | 'state' }) {

    this.masterList['cityList'] = [];

    this.service.getService({ "url": `/master/${fieldName == 'country' ? 'countries' : 'states' }/${this.f[fieldName].value}/cities` }).subscribe((res: any) => {

      this.masterList['cityList'] = res.status == 200 ? res.data : [];

    });

  }  

  // Get Areas based on City

  getAreas() {

    this.service.getService({ "url": `/master/cities/${this.f.city.value}/areas` }).subscribe((res: any) => {

      this.masterList['areaList'] = res.status == 200 ? res.data : [];

    });

  }

  // Initiate Company Details form

  loadForm() {

    console.log(this.service.userDetails);
    

    this.formSubmitted = false;

    this.addressDetailsFrom = this.service.fb.group({

      'address1': [this.service.userDetails.address1 || '', [Validators.required]],

      'address2': [this.service.userDetails.address2 || '', [Validators.required]],

      'area': [this.service.userDetails.area?.id || null, [Validators.required]],  
      
      'city': [this.service.userDetails.city?.id || null, [Validators.required]],

      'state': [this.service.userDetails.state?.id || null],

      'country': [this.service.userDetails.country?.id || null, [Validators.required]],

      'zipcode': [this.service.userDetails.zipcode || null, [Validators.required]],

    });

    if(!_.isEmpty(this.service.userDetails)) {

      this.getStates(); // Get States based on Country
  
      this.getCities({ 'fieldName': 'state' }); // Get Cities based on State

      this.getAreas(); // Get Areas based on City

    }

    // Listen to Country changes and update State, City, Area and zipcode

    this.addressDetailsFrom.controls['country'].valueChanges.subscribe((value: any) => {

      this.masterList = {
        ...this.masterList,
        stateList: [],
        cityList: [],
        areaList: []
      };

      let countryDet = _.find(this.masterList['countryList'], { 'id': value });

      this.addressDetailsFrom.patchValue({ 
        
        'city': null,
        
        'state': null,
        
        'area': null,
        
        'zipcode': null
      
      }, { emitEvent: false });

      if(countryDet.hasState == 1) {

        this.addressDetailsFrom.controls['state'].setValidators([Validators.required]);

        this.getStates(); // Get States based on Country        

      } else this.addressDetailsFrom.controls['state'].setValidators([]);

      this.addressDetailsFrom.controls['state'].updateValueAndValidity({ emitEvent: false });

      this.getCities({ 'fieldName': 'country' }); // Get Cities based on Country

    });

    // Listen to State changes and update City, Area and zipcode

    this.addressDetailsFrom.controls['state'].valueChanges.subscribe((value: any) => {

      this.getCities({ 'fieldName': 'state' }); // Get Cities based on State

      this.masterList['areaList'] = []; // Reset Area List

      this.addressDetailsFrom.patchValue({ 
        
        'city': null,
        
        'area': null,
        
        'zipcode': null 
      
      }, { emitEvent: false });

    });

    // Listen to City changes and update Area and zipcode

    this.addressDetailsFrom.controls['city'].valueChanges.subscribe((value: any) => {

      this.getAreas(); // Get Areas based on City

      this.addressDetailsFrom.patchValue({
        
        'area': null, 'areaName': '',
        
        'zipcode': null 
      
      });

    });

    // Listen to Area changes

    this.addressDetailsFrom.controls['area'].valueChanges.subscribe((value: any) => {

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

    this.service.postService({ "url": `/users/update/${this.service.userDetails.id}`, 'payload': payload, 'options': { 'Content-Type': 'application/x-www-form-urlencoded' } }).subscribe((res: any) => {

      if(res.status==200) {

        this.service.showToastr({ "data": { "message": "Address Details Updated Successfully", "type": "success" } });        

        this.isLoading = false;

        this.service.getUserDetails.subscribe((resOne: any) => {

          console.log(resOne);
          
          this.service.userDetails = resOne.status== 200 ? resOne.data : res.data;

          console.log(this.service.userDetails);

        });

      }

    },(err: any)=>{

      this.isLoading = false;

      this.service.showToastr({ "data": { "message": _.get(err, 'error.message', 'Something went wrong'), "type": "error" } });

    });

  }


}

  

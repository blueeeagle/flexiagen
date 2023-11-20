import { Component } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';
@Component({
  selector: 'app-company-details',
  templateUrl: './company-details.component.html',
  styleUrls: ['./company-details.component.scss']
})
export class CompanyDetailsComponent {

  companyForm!: FormGroup;
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

    this.formSubmitted = false;

    this.companyForm = this.service.fb.group({

      'companyName': ['', [Validators.required]],

      'ownerName': ['', [Validators.required]],

      'address1': ['', [Validators.required]],

      'area': [null, [Validators.required]],  

      'areaName': '',
      
      'city': [null, [Validators.required]],

      'cityName': '',

      'state': [null],

      'stateName': '',      

      'country': [null, [Validators.required]],

      'countryName': '',

      'zipcode': ['', [Validators.required]],

    });

    // Listen to Country changes and update State, City, Area and Zipcode

    this.companyForm.controls['country'].valueChanges.subscribe((value: any) => {

      this.masterList = {
        ...this.masterList,
        stateList: [],
        cityList: [],
        areaList: []
      };

      let countryDet = _.find(this.masterList['countryList'], { 'id': value });

      this.companyForm.patchValue({ 

        'countryName': countryDet?.title,
        
        'city': null, 'cityName': '',
        
        'state': null, 'stateName': '',
        
        'area': null, 'areaName': '',
        
        'zipcode': null
      
      }, { emitEvent: false });

      if(countryDet.hasState == 1) {

        this.companyForm.controls['state'].setValidators([Validators.required]);

        this.getStates(); // Get States based on Country        

      } else this.companyForm.controls['state'].setValidators([]);

      this.companyForm.controls['state'].updateValueAndValidity({ emitEvent: false });

      this.getCities({ 'fieldName': 'country' }); // Get Cities based on Country

    });

    // Listen to State changes and update City, Area and Zipcode

    this.companyForm.controls['state'].valueChanges.subscribe((value: any) => {

      this.getCities({ 'fieldName': 'state' }); // Get Cities based on State

      this.masterList['areaList'] = []; // Reset Area List

      this.companyForm.patchValue({ 

        'stateName': _.find(this.masterList['stateList'], { 'id': value })?.title,
        
        'city': null, 'cityName': '',
        
        'area': null, 'areaName': '',
        
        'zipcode': null 
      
      }, { emitEvent: false });

    });

    // Listen to City changes and update Area and Zipcode

    this.companyForm.controls['city'].valueChanges.subscribe((value: any) => {

      this.getAreas(); // Get Areas based on City

      this.companyForm.patchValue({
        
        'cityName': _.find(this.masterList['cityList'], { 'id': value })?.title,
        
        'area': null, 'areaName': '',
        
        'zipcode': null 
      
      });

    });

    // Listen to Area changes

    this.companyForm.controls['area'].valueChanges.subscribe((value: any) => {

      this.companyForm.patchValue({ 
      
        'areaName': _.find(this.masterList['areaList'], { 'id': value })?.title,
        
        'zipcode': null 
      
      });

    });

  }

  // convenience getter for easy access to form fields

  get f(): any { return this.companyForm.controls }

  // Register Company Details

  submit(): any {
    
    if(this.companyForm.invalid) return this.formSubmitted = true;

    this.isLoading = true

    let payload: any = _.omit(this.companyForm.value,['countryName','stateName','cityName','areaName']);

    payload['ownerName'] = payload.ownerName.replace(/[0-9]/g, '');

    this.service.postService({ "url": `/users/update/${this.service.userDetails.id}`, 'payload': payload, 'options': { 'Content-Type': 'application/x-www-form-urlencoded' } }).subscribe((res: any) => {

      if(res.status==200) {

        this.isLoading = false;

        this.service.showToastr({ "data": { "message": "Company Details Created Successfully", "type": "success" } });

        this.service.getUserDetails.subscribe((resOne: any) => {

          this.service.userDetails = resOne.status== 200 ? resOne.data : res.data;

          this.service.session({ 'method': 'set', 'key': 'CompanyStatus', 'value': 'Created' });

          this.service.navigate({ 'url': '/pages/dashboard' });

        });

        this.service.navigate({ 'url': '/pages/dashboard' });

      } else this.isLoading = false;

    },(err: any)=>{

      this.isLoading = false;

      this.service.showToastr({ "data": { "message": _.get(err, 'error.message', 'Something went wrong'), "type": "error" } });

    });

  }

  showCompanyDetails(): any {

    if(this.companyForm.invalid) return this.formSubmitted = true;

    this.showPreview = true;

  }

}

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
  formSubmitted = false;
  masterList: any = {
    countryList: [],
    cityList: [],
    areaList: []
  };
  showPreview: boolean = false;

  constructor(private service: CommonService) { 

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

      'address': ['', [Validators.required]],

      'area': [null, [Validators.required]],  

      'areaName': '',
      
      'city': [null, [Validators.required]],

      'cityName': '',

      'state': [null, [Validators.required]],

      'stateName': '',      

      'country': [null, [Validators.required]],

      'countryName': '',

      'zipcode': ['', [Validators.required]],

    });

    /** Temporarily set default values for testing */

    this.companyForm.patchValue({

      "companyName": "Bubbles Dry Cleaners",
      "ownerName": "Gowtham",
      "address": "Ganapthy",
      "area": "64f4a0632797311d33d0718e",
      "areaName": "Gutur",
      "city": "64f9d6d80ee655dbcadbacbd",
      "cityName": "Chennai",
      "state": "64f47b8e2797311d33d070e8",
      "stateName": "Tamilnadu",
      "country": "64f46cf05c078933a12f59ed",
      "countryName": "India",
      "zipcode": "600010"

    });

    this.getStates(); // Get States based on Country

    this.getCities({ 'fieldName': 'state' }); // Get Cities based on State

    this.getAreas(); // Get Areas based on City

    /** Temporarily set default values for testing */

    // Listen to Country changes and update State, City, Area and Zipcode

    this.companyForm.controls['country'].valueChanges.subscribe((value: any) => {

      this.masterList['areaList'] = []; // Reset Area List

      this.companyForm.patchValue({ 

        'countryName': _.find(this.masterList['countryList'], { 'id': value })?.title,
        
        'city': null, 'cityName': '',
        
        'state': null, 'stateName': '',
        
        'area': null, 'areaName': '',
        
        'zipcode': null
      
      }, { emitEvent: false });

      this.getStates(); // Get States based on Country      

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

    let payload = _.omit(this.companyForm.value,['countryName','stateName','cityName','areaName']);

    // this.service.postService({ "url": "/users/register", 'payload': payload, 'options': { 'Content-Type': 'application/x-www-form-urlencoded' } }).subscribe((res: any) => {

    //   if(res.status==200) {

    //     this.service.showToastr({ "data": { "message": "Company Details Created Successfully", "type": "success" } });

    //   }

    // },(err: any)=>{

    //   this.service.showToastr({ "data": { "message": _.get(err, 'error.message', 'Something went wrong'), "type": "error" } });

    // });

  }

  showCompanyDetails(): any {

    if(this.companyForm.invalid) return this.formSubmitted = true;

    this.showPreview = true;

  }

}

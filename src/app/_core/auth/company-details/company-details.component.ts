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
    countryDet: {},
    stateList: [],
    cityList: [],
    areaList: []
  };
  showPreview: boolean = false;
  appServiceChargeDet: any = { 'pos': '0', 'online': '0', 'logistics': '0' };
  _: any = _;

  constructor(public service: CommonService) { 

  }

  ngOnInit(): void {

    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    
    this.loadForm();

    this.getCountries();

  }

  // Get Application Service List

  getAppServiceCharges() {

    this.appServiceChargeDet = { 'pos': '0', 'online': '0', 'logistics': '0' };

    this.service.getService({ "url": `/app/charges/${this.af.countryId.value}` }).subscribe((res: any) => {

      if(res.status=='ok') {

        this.masterList['countryDet'] = _.pick(res.data,['decimalPoints','currencyCode']);

        _.reduce({ 'pos': '0', 'online': '0', 'logistics': '0' }, (result: any, v: any, key: any) => {

          let chargesDet = _.find(res.data.charges, { 'name': key });

          const { value, type } = chargesDet;

          result[key] = type == 'percentage' ? `${value}%` : `${value.toFixed(this.masterList['countryDet'].decimalPoints)} ${this.masterList['countryDet'].currencyCode}`;

          return result;

        }, this.appServiceChargeDet);

      }

    });

  }

  // Get Countries List

  getCountries() {

    this.masterList['countryList'] = [];

    this.service.getService({ "url": "/address/countries" }).subscribe((res: any) => {

      this.masterList['countryList'] = res.status=='ok' ? res.data : [];

    });

  }

  // Get States based on Country

  getStates() {

    this.masterList['stateList'] = [];

    this.service.getService({ "url": `/address/states/${this.af.countryId.value}` }).subscribe((res: any) => {

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

    this.service.getService({ "url": `/address/cities/${fieldName == 'countryId' ? 'country' : 'state' }/${this.af[fieldName].value}` }).subscribe((res: any) => {

      this.masterList['cityList'] = res.status == 'ok' ? res.data : [];

    });

  }  

  // Get Areas based on City

  getAreas() {

    this.service.getService({ "url": `/address/areas/${this.af.cityId.value}` }).subscribe((res: any) => {

      this.masterList['areaList'] = res.status == 'ok' ? res.data : [];

    });

  }

  // Initiate Company Details form

  loadForm() {

    this.formSubmitted = false;

    this.companyForm = this.service.fb.group({

      'companyName': ['', [Validators.required]],

      'ownerName': ['', [Validators.required]],

      "addressDetails": this.service.fb.group({

        'addressLine1': ['', [Validators.required]],

        'addressLine2': '',

        'areaId': [null, [Validators.required]],  

        'areaName': '',

        'cityId': [null, [Validators.required]],

        'cityName': '',

        'stateId': [null],

        'stateName': '',

        'countryId': [null, [Validators.required]],

        'countryName': '',

        'zipcode': ['', [Validators.required]],

      })

    });

    // Listen to Country changes and update State, City, Area and Zipcode

    this.af.countryId.valueChanges.subscribe((value: any) => {

      this.masterList = { ...this.masterList, 'stateList': [], 'cityList': [], 'areaList': [] };

      this.masterList['countryDet'] = _.find(this.masterList['countryList'], { '_id': value });

      this.getAppServiceCharges();

      this.f.addressDetails.patchValue({ 
        
        'cityId': null, 'stateId': null, 'areaId': null, 'zipcode': null,

        'countryName': this.masterList['countryDet']?.name || '', 'stateName': '', 'cityName': '', 'areaName': ''
      
      }, { emitEvent: false });

      if(this.masterList['countryDet'].hasState) {

        this.af.stateId.setValidators([Validators.required]);

        this.getStates(); // Get States based on Country        

      } else {
        
        this.af.stateId.setValidators([]);

        this.getCities({ 'fieldName': 'countryId' }); // Get Cities based on Country

      }

      this.af.stateId.updateValueAndValidity({ emitEvent: false });

    });

    // Listen to State changes and update City, Area and Zipcode

    this.af.stateId.valueChanges.subscribe((value: any) => {

      this.getCities({ 'fieldName': 'stateId' }); // Get Cities based on State

      this.masterList['areaList'] = []; // Reset Area List

      this.f.addressDetails.patchValue({ 
        
        'cityId': null, 'areaId': null, 'zipcode': null,

        'stateName': _.find(this.masterList['stateList'], { '_id': value })?.name || '', 'cityName': '', 'areaName': ''
      
      }, { emitEvent: false });

    });

    // Listen to City changes and update Area and Zipcode

    this.af.cityId.valueChanges.subscribe((value: any) => {

      this.getAreas(); // Get Areas based on City

      this.f.addressDetails.patchValue({ 
        
        'areaId': null, 'zipcode': null,

        'cityName': _.find(this.masterList['cityList'], { '_id': value })?.name || '', 'areaName': ''
      
      });

    });

    // Listen to Area changes

    this.f.addressDetails.controls['areaId'].valueChanges.subscribe((value: any) => {

      let areaDet = _.find(this.masterList['areaList'], { '_id': value });

      this.f.addressDetails.patchValue({ 

        'areaName': areaDet?.name || '',
        
        'zipcode': areaDet?.zipCode || '' 
      
      });

    });

  }

  // convenience getter for easy access to form fields

  get f(): any { return this.companyForm.controls }

  get af(): any { return this.f.addressDetails.controls }

  // Register Company Details

  submit(): any {
    
    if(this.companyForm.invalid) return this.formSubmitted = true;

    this.isLoading = true

    let payload: any = this.companyForm.value;

    payload['addressDetails'] = _.omit(payload.addressDetails, ['countryName', 'stateName', 'cityName', 'areaName']);

    payload['ownerName'] = payload.ownerName.replace(/[0-9]/g, '');

    this.service.postService({ "url": `/users/update/${this.service.userDetails._id}`, 'payload': payload, 'options': { 'Content-Type': 'application/x-www-form-urlencoded' } }).subscribe((res: any) => {

      if(res.status=='ok') {

        this.isLoading = false;

        this.service.showToastr({ "data": { "message": "Company Details Created Successfully", "type": "success" } });

        this.service.companyDetails = _.omit(res.data,['agentId']);

        this.service.session({ "method": "set", "key": "CompanyId", "value": this.service.companyDetails._id });

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

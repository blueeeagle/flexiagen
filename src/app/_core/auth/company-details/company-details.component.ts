import { Component } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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
  paymentFailedMsg: String = "";
  constructor(public service: CommonService, private route: ActivatedRoute) { 

  }

  ngOnInit(): void {

    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    
    this.loadForm();

    this.getCountries();

    this.route.params.subscribe((params: any) => {
      
       const validationRegex = new RegExp("^[0-9a-fA-F]{24}$");
      
      if (validationRegex.test(params.paymentId)) {

        this.isLoading = true;

        this.showPreview = true;
              
        const payload: any = JSON.parse(this.service.session({ method : "get", key : "payload"}));

        const formVal: any = JSON.parse(this.service.session({ method : "get", key : "payload"}));

        this.companyForm.patchValue(formVal);
                
        this.service.getService({ "url": `/pg/getPaymentDetail/${params.paymentId}` }).subscribe((res: any) => {
          
          if (res.status == "ok") {
                          
            if (res.data?.status == "CAPTURED") this.createCompany(payload);

            else {

              this.paymentFailedMsg = `The initiated payment was ${res.data?.status}. Please retry/Contact admin`;

              this.isLoading = false;
            }
              
          }
        },
          (error: any) => {
          
            this.service.showToastr({ data: { message: "Payment status fetching failed. Please try again later" } });

            this.paymentFailedMsg = `Please don't worry. If your payment was deducted we'll notify ASAP.`;
        })
        
      }      
        
    });

  }

  // Get Application Service List

  getAppServiceCharges() {

    this.appServiceChargeDet = { 'pos': '0', 'online': '0', 'logistics': '0' };

    this.service.getService({ "url": `/setup/charges/${this.af.countryId.value}` }).subscribe((res: any) => {

      if(res.status=='ok') {

        _.reduce({ 'pos': '0', 'online': '0', 'logistics': '0' }, (result: any, v: any, key: any) => {

          let chargesDet = _.find(res.data.charges, { 'name': key });

          const { value, type } = chargesDet;

          result[key] = type == 'percentage' ? `${value}%` : `${value.toFixed(this.masterList['currencyDet']?.decimalPoints || 3)} ${this.masterList['currencyDet']?.currencyCode}`;

          return result;

        }, this.appServiceChargeDet);

      }

    });

  }

  // Get Countries List

  getCountries() {

    this.masterList['countryList'] = [];

    this.service.getService({ "url": "/address/countries", 'params': { 'incl': 'currencyDetails' } }).subscribe((res: any) => {

      this.masterList['countryList'] = res.status=='ok' ? res.data : [];

      fetch('https://ipapi.co/json/').then((res: any) => res.json()).then((res: any) => {

        this.af.countryId.setValue(_.find(this.masterList['countryList'], { 'iso3': res.country_code_iso3 })?._id || null);

      });    

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

      "currencyId": [null, [Validators.required]],

      "addressDetails": this.service.fb.group({

        "street": [ '', [Validators.required]],

        "building": [''],
  
        "block": [''],
  
        "others": [''],

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

      this.masterList['currencyDet'] = this.masterList['countryDet']?.currencyId || {};

      this.companyForm.patchValue({ 'currencyId': this.masterList['currencyDet']?._id || null }, { emitEvent: false });

      this.f.addressDetails.patchValue({ 
        
        'cityId': null, 'stateId': null, 'areaId': null, 'zipcode': null,

        'countryName': this.masterList['countryDet']?.name || '', 'stateName': '', 'cityName': '', 'areaName': ''
      
      }, { emitEvent: false });

      this.getAppServiceCharges();

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
        
        'zipcode': areaDet?.zipcode || '' 
      
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

    let companyPayload: any = this.companyForm.value;

    companyPayload['addressDetails'] = _.omit(companyPayload.addressDetails, ['countryName', 'stateName', 'cityName', 'areaName']);

    companyPayload['ownerName'] = companyPayload.ownerName.replace(/[0-9]/g, '');

    this.createCompany(companyPayload);

    // // return;
    
    // const payload = {

    //   "amount": 100,
      
    //   "currency": "BHD",
      
    //   "customerInfo": {
        
    //     "firstName": companyPayload?.ownerName,
        
    //     "email": "akajithkumar9700@gmail.com",
        
    //   }

    // };

    // this.service.postService({ url: "/pg/initiatePayment", payload }).subscribe((res: any) => {
      
    //   if (res.status == "ok") {

    //     this.service.session({ "method": "set", "key": "payload", "value": JSON.stringify(companyPayload) });

    //     this.service.session({ "method": "set", "key": "formVal", "value": JSON.stringify(this.companyForm.value) });

    //     window.location.href = res.data.url;
          
    //     this.isLoading = false;
        
    //   }

    // },
    //   (error: any) => {

    //     this.isLoading = false;
      
    //     this.service.showToastr({ data: { message: error.error.message, type: "error" } });
    // });

  }

  createCompany(payload : any) {
    
      this.service.postService({ "url": `/setup/company`, 'payload': payload }).subscribe((res: any) => {

      if(res.status=='ok') {

        this.isLoading = false;

        this.paymentFailedMsg = "";

        this.service.showToastr({ "data": { "message": "Company Details Created Successfully", "type": "success" } });

        this.service.companyDetails = res.data.companyDetails;

        this.service.currencyDetails = this.service.companyDetails.currencyId;

        this.service.userDetails = res.data.userDetails;

        this.service.session({ "method": "set", "key": "UserDetails", "value": JSON.stringify(this.service.userDetails) });

        this.service.session({ "method": "set", "key": "CompanyDetails", "value": JSON.stringify(_.omit(this.service.companyDetails,'currencyId')) });

        this.service.session({ "method": "set", "key": "CurrencyDetails", "value": JSON.stringify(this.service.currencyDetails) });

        this.service.session({ "method": "set", "key": "AuthToken", "value": res.data.token });

        this.service.session({ "method": "set", "key": "AuthToken", "value": res.data.token });

        this.service.session({ method: 'remove', 'key': 'payload' });

        this.service.session({ method: 'remove', 'key': 'formVal' });

        this.service.navigate({ 'url': '/pages/dashboard' });

      } else this.isLoading = false;

    },(err: any)=>{

      this.isLoading = false;

      this.service.showToastr({ "data": { "message": _.get(err, 'error.message', 'Something went wrong'), "type": "error" } });

      });
    
  }

  showCompanyDetails(event: any): any {

    event.preventDefault();

    if(this.companyForm.invalid) return this.formSubmitted = true;

    this.showPreview = true;

  }

}

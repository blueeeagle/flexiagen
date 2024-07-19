import { Component } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';
import * as moment from 'moment';
@Component({
  selector: 'app-company-details',
  templateUrl: './company-details.component.html',
  styleUrls: ['./company-details.component.scss']
})
export class CompanyDetailsComponent {

  companyForm!: FormGroup;
  paymentForm!: FormGroup;
  formSubmitted: boolean = false;
  paymentFormSubmitted: boolean = false;
  isLoading: boolean = false;
  isPaymentLoading: boolean = false;
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
  paymentInit: boolean = false;
  paymentInProgress: boolean = false;

  constructor(public service: CommonService, private route: ActivatedRoute) { 

  }

  ngOnInit(): void {

    this.service.userDetails = JSON.parse(this.service.session({ "key": "UserDetails", "method": "get" })) || {};
    
     this.loadForm();

    this.getCountries();

    this.route.queryParams.subscribe(params => {
      
      console.log({ params });

      const paymentInitValue = JSON.parse(this.service.session({ method: 'get', key: 'paymentValue' }));

      const companyPayload = JSON.parse(this.service.session({ method: "get", key: "companyPayload" }));

      if (!_.isEmpty(paymentInitValue) && !_.isEmpty(companyPayload)) {

        this.service.setApiLoaders({ "isLoading": true, "url": [`/payment/success/authorize/${paymentInitValue?.agentId}/${paymentInitValue?.countryId}`] });

        this.paymentInProgress = true;
        
        this.service.getService({ url: `/payment/success/authorize/${paymentInitValue?.agentId}/${paymentInitValue?.countryId}`, params }).subscribe((res: any) => {
          
          if (res.status == "ok") {
              
            this.createCompany(companyPayload);
          }
  
        },
          (error: any) => {
          
            this.service.showToastr({ data: { message: "Sorry, We are unable to getting the payment details.", type: "warn" } });

            // this.createCompany(companyPayload);
        });

      }

    });
    
   

  }

  // Get Application Service List

  getAppServiceCharges() {

    this.appServiceChargeDet = { 'pos': '0', 'online': '0', 'logistics': '0' };

    this.service.getService({ "url": `/setup/charges/${this.af.countryId.value}` }).subscribe((res: any) => {

      if(res.status=='ok') {

        this.masterList['charges'] = res.data.charges;

        _.reduce({ 'pos': '0', 'online': '0', 'logistics': '0' }, (result: any, v: any, key: any) => {

          let chargesDet = _.find(res.data.charges, { 'name': key });

          const { value, type } = chargesDet;

          result[key] = type == 'percentage' ? `${value}%` : `${value.toFixed(this.masterList['currencyDet']?.decimalPoints || 3)} ${this.masterList['currencyDet']?.currencyCode}`;

          return result;

        }, this.appServiceChargeDet);

        console.log("charge", this.appServiceChargeDet);
        

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

    this.paymentFormSubmitted = false;

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

      }),

    });

    this.paymentForm = this.service.fb.group({

      "card_number": [null, Validators.required],

      "exp_month": [null, Validators.compose([Validators.required])],

      "exp_year": [null, Validators.compose([Validators.required])],
        
      "scode": [null, Validators.compose([Validators.required, Validators.minLength(3)])],
        
      "name": [null, Validators.required]
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

    this.cf.exp_month.valueChanges.subscribe((value: any) => {

      if(value) this.cf.exp_month.setValue(moment(parseInt(value), 'M').format('MM'), { emitEvent: false });
    });

  }

  // convenience getter for easy access to form fields

  get f(): any { return this.companyForm.controls }

  get af(): any { return this.f.addressDetails.controls }

  get cf(): any {

    console.log(this.paymentForm.controls)
    
    return this.paymentForm.controls;
  }


  // Register Company Details

  constructCompanyPayload(): any {

    // if(this.companyForm.invalid) return this.formSubmitted = true;

    let companyPayload: any = this.companyForm.value;

    companyPayload['addressDetails'] = _.omit(companyPayload.addressDetails, ['countryName', 'stateName', 'cityName', 'areaName']);

    companyPayload['ownerName'] = companyPayload.ownerName.replace(/[0-9]/g, '');

    this.service.session({ method: "set", key: "companyPayload", value: JSON.stringify(companyPayload) });
    
  }

  getFullYear(year : any) {
  
      // Concatenate to form the full year
    let fullYear = (Math.floor(moment().year() / 100) * 100 + parseInt(year));
    
    return fullYear
  }

  initPayment() {

    this.paymentFormSubmitted = true;
    
    if (this.cf.invalid) this.service.showToastr({ data: { message: "Fill required values", type: "warn" } });

    const paymentValue = this.paymentForm.value;

    const payload = {

      "cardDetails": {
        "card_number": (paymentValue.card_number) ? parseInt(paymentValue.card_number.replace(/\s+/g, '')) : "",
        "exp_month": parseInt(paymentValue.exp_month),
        "exp_year": this.getFullYear(paymentValue.exp_year),
        "scode": parseInt(paymentValue.scode),
        "name": paymentValue.name
      },

      "amount": parseInt(this.appServiceChargeDet?.pos.split('.')[0]),
      
      "countryCode": this.af.countryId.value

    };

    const paymentCheckObj = {

      "agentId": this.service.userDetails._id,

      "countryId" : this.af.countryId.value
    }

    console.log({ payload });

    console.log({ paymentCheckObj });

    // return;

    this.isPaymentLoading = true;
    this.paymentFailedMsg = "";

    this.service.postService({ url: `/pg/initiatePayment`, payload }).subscribe((res: any) => {

      if (res.status == "ok") {
        
        const paymentRes = res.data;
  
        if (paymentRes.transaction?.url) {

          console.log(paymentRes.transaction?.url);
          
          this.service.session({ method: "set", key: "paymentValue", value: JSON.stringify(paymentCheckObj) });

          this.constructCompanyPayload();

          this.isPaymentLoading = false;
  
          window.location.href = paymentRes.transaction?.url;
        }
        
      }
      
    },
      (error: any) => {

        console.log(error);
        
        this.paymentFailedMsg = "Sorry, your given payment details are invalid. Please check your provided details.";

        this.isPaymentLoading = false;
    });

  }


  createCompany(payload : any) {
    
      this.service.postService({ "url": `/setup/company`, 'payload': payload }).subscribe((res: any) => {

      if(res.status=='ok') {

        this.isLoading = false;

        this.paymentInit = false;

        this.paymentFailedMsg = "";

        this.service.session({ method: "remove", key: "paymentValue" });

        this.service.session({ method: "remove", key: "companyPayload" });

        this.service.showToastr({ "data": { "message": "Company Details Created Successfully", "type": "success" } });

        this.service.companyDetails = res.data.companyDetails;

        this.service.currencyDetails = this.service.companyDetails.currencyId;

        this.service.userDetails = res.data.userDetails;

        this.service.session({ "method": "set", "key": "UserDetails", "value": JSON.stringify(this.service.userDetails) });

        this.service.session({ "method": "set", "key": "CompanyDetails", "value": JSON.stringify(_.omit(this.service.companyDetails,'currencyId')) });

        this.service.session({ "method": "set", "key": "CurrencyDetails", "value": JSON.stringify(this.service.currencyDetails) });

        this.service.session({ "method": "set", "key": "AuthToken", "value": res.data.token });

        this.service.session({ "method": "set", "key": "AuthToken", "value": res.data.token });

        // if(this.service.userDetails.pos && _.get(_.find(this.masterList['charges'],{ 'name': 'pos' }),'value') > 0) {

        //   this.service.navigate({ 'url': '/auth/payment' });

        // } else 
        
          this.service.navigate({ 'url': '/auth/approval-pending' });

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

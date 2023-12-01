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
  userSubscribe: any;

  constructor(public service: CommonService) { 

    this.userSubscribe = this.service.userDetailsObs.subscribe((value)=>{

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

    this.service.getService({ "url": "/address/countries" }).subscribe((res: any) => {

      this.masterList['countryList'] = res.status=='ok' ? res.data : [];

    });

  }

  // Get States based on Country

  getStates() {

    this.masterList['stateList'] = [];

    this.service.getService({ "url": `/address/states/${this.f.countryId.value}` }).subscribe((res: any) => {

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

    this.service.getService({ "url": `/address/cities/${fieldName == 'countryId' ? 'country' : 'state' }/${this.f[fieldName].value}` }).subscribe((res: any) => {

      this.masterList['cityList'] = res.status=='ok' ? res.data : [];

    });

  }  

  // Get Areas based on City

  getAreas() {

    this.service.getService({ "url": `/address/areas/${this.f.cityId.value}` }).subscribe((res: any) => {

      this.masterList['areaList'] = res.status=='ok' ? res.data : [];

    });

  }

  // Initiate Company Details form

  loadForm() {

    this.formSubmitted = false;

    this.addressDetailsFrom = this.service.fb.group({

      'addressLine1': [this.service.companyDetails?.addressDetails?.addressLine1 || '', [Validators.required]],

      'addressLine2': [this.service.companyDetails?.addressDetails?.addressLine2 || ''],

      'areaId': [this.service.companyDetails?.addressDetails?.areaId?._id || null, [Validators.required]],  
      
      'cityId': [this.service.companyDetails?.addressDetails?.cityId?._id || null, [Validators.required]],

      'stateId': [this.service.companyDetails?.addressDetails?.stateId?._id || null],

      'countryId': [this.service.companyDetails?.addressDetails?.countryId?._id || null, [Validators.required]],

      'zipcode': [this.service.companyDetails?.addressDetails?.zipcode || null, [Validators.required]],

    });

    if(!_.isEmpty(this.service.companyDetails?.addressDetails)) {

      this.getStates(); // Get States based on Country
  
      this.getCities({ 'fieldName': this.f.stateId.value ? 'stateId' : 'countryId' }); // Get Cities based on State

      this.getAreas(); // Get Areas based on City

    }

    // Listen to Country changes and update State, City, Area and zipcode

    this.addressDetailsFrom.controls['countryId'].valueChanges.subscribe((value: any) => {

      this.masterList = { ...this.masterList, 'stateList': [], 'cityList': [], 'areaList': [] };

      let countryDet = _.find(this.masterList['countryList'], { '_id': value });

      this.addressDetailsFrom.patchValue({ 'cityId': null, 'stateId': null, 'areaId': null, 'zipcode': null }, { emitEvent: false });

      if(countryDet.hasState) {

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

      this.addressDetailsFrom.patchValue({ 'cityId': null, 'areaId': null, 'zipcode': null }, { emitEvent: false });

    });

    // Listen to City changes and update Area and zipcode

    this.addressDetailsFrom.controls['cityId'].valueChanges.subscribe((value: any) => {

      this.getAreas(); // Get Areas based on City

      this.addressDetailsFrom.patchValue({ 'areaId': null, 'zipcode': null });

    });

    // Listen to Area changes

    this.addressDetailsFrom.controls['areaId'].valueChanges.subscribe((value: any) => {

      this.addressDetailsFrom.patchValue({ 
        
        'zipcode': _.get(_.find(this.masterList['areaList'], { '_id': value }), 'zipCode', null) 
      
      });

    });

  }

  // convenience getter for easy access to form fields

  get f(): any { return this.addressDetailsFrom.controls }

  submit(): any {
    
    if(this.addressDetailsFrom.invalid) return this.formSubmitted = true;

    this.isLoading = true

    let payload: any = this.addressDetailsFrom.value;

    this.service.patchService({ "url": `/app/company/addressDetails/${this.service.companyDetails._id}`, 'payload': payload}).subscribe((res: any) => {

      if(res.status=='ok') {

        this.service.showToastr({ "data": { "message": "Address Details Updated Successfully", "type": "success" } });        

        this.service.companyDetails = _.omit(res.data,'agentId');

        this.service.userDetails = _.get(res.data,'agentId');

        this.service.userDetailsObs.next(this.service.userDetails);

      }

      this.isLoading = false;

    },(err: any)=>{

      this.isLoading = false;

      this.service.showToastr({ "data": { "message": _.get(err, 'error.message', 'Something went wrong'), "type": "error" } });

    });

  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.userSubscribe.unsubscribe();
  }

}

  

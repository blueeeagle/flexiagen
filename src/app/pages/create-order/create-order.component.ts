import { Component, ViewChild } from '@angular/core';
import { FormArray, Validators } from '@angular/forms';
import { ModalComponent, OffcanvasComponent } from '@shared/components';
import { ConfirmationDialogService } from '@shared/components/confirmation-dialog/confirmation.service';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { forkJoin, from } from 'rxjs';
declare var $: any;

@Component({
  selector: 'app-create-order',
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.scss']
})
export class CreateOrderComponent {

  @ViewChild('canvas') canvas!: OffcanvasComponent;
  @ViewChild('customerVerificationModal') customerVerificationModal!: ModalComponent;
  @ViewChild('addProductsModal') addProductsModal!: ModalComponent;
  @ViewChild('orderPreviewModal') orderPreviewModal!: ModalComponent;
  
  otp: string[] = ["", "", "", "", "", ""];
  timer: number = 60;
  orderForm: any;
  mode: string = 'Create';
  editData: any;
  customerForm: any;
  addressForm: any;
  filterForm: any;
  basketForm: any;
  selectedItemDet: any = {};
  openCanvas: boolean = false;
  formSubmitted: any = {
    "customerForm": false,
    "orderForm": false,
    "customerSearched": false
  };
  canvasConfig: any = {
    "canvasName": "addCustomer",
    "canvasTitle": "Add Customer",
    "applyBtnTxt": "Save",
    "cancelBtnTxt": "Clear",
    "showCancelBtn": true
  };
  masterList: any = {
    "dialCodeList": [],
    "countryList": [],
    "stateList": [],
    "cityList": [],
    "areaList": [],
    "productCharges": [],
    "categoryList": [],
    "workingHours": [],
    "activeDays": []
  };
  disabledBtn: string = "";
  _: any = _;
  step = 0;
  userSubscribe: any;
  selectedItems: any = [];
  selectedCustomerDet: any;
  agentProductsCount: any = 0;
  moment: any = moment;

  constructor(public service: CommonService, private confirmationDialog: ConfirmationDialogService) { 

    this.loadFilterForm();

    if(!_.isEmpty(this.service.companyDetails)) {

      this.loadForm();
      this.loadCustomerForm({});
      this.loadBasketForm({});
      this.getBasicDetails();

    } else {

      this.userSubscribe = this.service.userDetailsObs.subscribe((value) => {

        if (!_.isEmpty(value)) {
  
          this.loadForm();
          this.loadCustomerForm({});
          this.loadBasketForm({});
          this.getBasicDetails();
        }
  
      });      

    }

  }

  ngOnInit(): void {

    this.loadForm();
    this.loadCustomerForm({});
    this.loadBasketForm({});    

  }

  getBasicDetails() {

    forkJoin({

      "countries": this.service.getService({ "url": "/address/countries" }),

      "dialCodes": this.service.getService({ "url": "/address/dialCode" }),

      "categories": this.service.postService({ "url": "/master/categories" }),

      "workingHours": this.service.postService({ "url": "/setup/workingHrs/list", "payload": { "is_active": true } })

    }).subscribe((res: any) => {

      this.masterList["countryList"] = res.countries.status == "ok" ? res.countries.data : [];

      this.masterList["dialCodeList"] = res.dialCodes.status == "ok" ? res.dialCodes.data : [];

      this.masterList["categoryList"] = res.categories.status == "ok" ? res.categories.data : [];

      this.masterList["workingHours"] = res.workingHours.status == "ok" ? res.workingHours.data : [];

      this.masterList['activeDays'] = _.map(this.masterList['workingHours'], 'day');

      this.filterForm.patchValue({ 'categoryId': _.map(this.masterList['categoryList'], '_id') });

      this.getMyProducts();

    });

  }

  getTimeSlots({ fieldName = 'pickupDate' }: { fieldName: 'pickupDate' | 'expDeliveryDate' }) {

    const timeFieldName = fieldName == 'pickupDate' ? 'pickupTimeSlot' : 'expDeliveryTimeSlot';

    this.masterList[fieldName] = { 'timeSlots': [] };

    if(this.f.pickupDate.value && this.f.expDeliveryDate.value && moment(this.f.pickupDate.value).isAfter(this.f.expDeliveryDate.value)) {

      this.orderForm.patchValue({ [fieldName]: null, [timeFieldName]: null, [timeFieldName+'Det']: null });

      if(fieldName == 'pickupDate') return this.service.showToastr({ "data": { "message": "Pickup date should be less than or equal to expected delivery date", "type": "info" } });

      return this.service.showToastr({ "data": { "message": "Expected delivery date should be greater than or equal to pickup date", "type": "info" } });

    }

    if(moment(this.f[fieldName].value).format('dddd') == 'Invalid date') {
      
      return this.orderForm.patchValue({ [fieldName]: null, [timeFieldName]: null, [timeFieldName+'Det']: null });

    }

    let payload = { 'day': moment(this.f[fieldName].value).format('dddd'), 'date': moment(this.f[fieldName].value).format('YYYY-MM-DD'), 'is_active': true };

    this.service.postService({ 'url': '/setup/timeslot/list', 'payload': _.pickBy({ 'companyId': this.service.companyDetails._id, ...payload }) }).subscribe((res:any)=>{

      if(res?.status == 'ok') {

        this.masterList[fieldName]['timeSlots'] = res.data || [];

        if(_.size(this.masterList[fieldName]['timeSlots']) == 0) {

          this.service.showToastr({ "data": { "message": "Please add time slots for selected day", "type": "info" } });

          this.orderForm.patchValue({ [fieldName]: null, [timeFieldName]: null, [timeFieldName+'Det']: null });

        }        

      }

    })

  }  

  getMyProducts() {

    let params = { 'searchValue': this.filterForm.value.searchValue };

    this.service.postService({ "url": "/setup/agentProducts", params, "payload": _.pick(this.filterForm.value,"categoryId") }).subscribe((res: any) => {

      if(res.status == "ok") {

        this.masterList['agentProducts'] = res.data;

        this.masterList['agentProducts'] = _.map(this.masterList['agentProducts'], (e: any) => {
  
          e.productId.productImageURL = this.service.getFullImagePath({ 'imgUrl': e?.productId?.productImageURL });
          
          return e;
  
        });

        setTimeout(() => {

          $('#searchValue').click();

          $('#searchValue').focus()

        }, 100);
  
        this.agentProductsCount = res.totalCount;

      }

    });

  }  

  // Get States based on Country
  getStates() {

    this.masterList['stateList'] = [];

    this.service.getService({ "url": `/address/states/${this.adf.countryId.value}` }).subscribe((res: any) => {

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

    this.service.getService({ "url": `/address/cities/${fieldName == 'countryId' ? 'country' : 'state' }/${this.adf[fieldName].value}` }).subscribe((res: any) => {

      this.masterList['cityList'] = res.status=='ok' ? res.data : [];

    });

  }

  // Get Areas based on City
  getAreas() {

    this.service.getService({ "url": `/address/areas/${this.adf.cityId.value}` }).subscribe((res: any) => {

      this.masterList['areaList'] = res.status=='ok' ? res.data : [];

    });

  }   
  
  checkIsWorkingDay = (d: Date | null): boolean => {
    return _.includes(this.masterList['activeDays'], moment(d).format('dddd'));
  };  

  loadFilterForm() {

    this.filterForm = this.service.fb.group({ 
      
      'categoryId': [],

      'searchValue': ''
    
    });

  }

  loadForm() {

    this.orderForm = this.service.fb.group({

      'searchCustomer': [''],

      'customerDetails': this.editData?.customerId || null,

      'customerId': [ this.editData?.customerId?._id ||'', Validators.required],

      'isExistingCustomer': this.mode == 'Update',

      'companyId': [ this.service?.companyDetails?._id, Validators.required],

      "orderDate": [ moment().format('YYYY-MM-DD') ],

      "currencyId": [ this.service.currencyDetails._id ],

      'orderStatus': ['Order Placed'],

      'orderType': ['normal'],

      'orderMode': ['POS'],

      'deliveryAvailable': [false],

      'pickupAvailable': [false],

      'pickupDate': [null],

      'pickupTimeSlot': [null],

      'pickupTimeSlotDet': [null],

      'expDeliveryDate': [null, [Validators.required]],

      'expDeliveryTimeSlot': [null, [Validators.required]],

      'expDeliveryTimeSlotDet': [null],

      'itemList': this.service.fb.array([]),

      'discApplied': [false],

      'discType': ['percentage'],

      'discPercentage': [null],

      'qty': [0, Validators.required],

      'netAmt': [0, Validators.required],

      'deliveryCharges': [0],

      'discAmt': [null, Validators.required],

      'grossAmt': [0, Validators.required],

      'paymentMode': ['Cash'],  

      "paymentOnDelivery": [false],

      "paymentList": this.service.fb.array([]),

      "paymentReceived": [0, [Validators.required]],

      "paymentPending": [0],  

      "selectedAddr": -1

    });

    this.orderForm.get("pickupAvailable").valueChanges.subscribe((value: any) => {

      this.orderForm.patchValue({ 'pickupDate': null, 'pickupTimeSlot': null, 'pickupTimeSlotDet': null });

      if(value) {

        this.f.pickupDate.setValue(moment().format('YYYY-MM-DD'));
        
      }

      this.service.updateValidators({ 'formGroup': this.orderForm, 'formControls': ['pickupDate', 'pickupTimeSlot'], 'validators': value ? [Validators.required] : [] });

    });

    this.orderForm.get('paymentOnDelivery').valueChanges.subscribe((value: any) => {

      this.orderForm.patchValue({ 'paymentMode': !value ? 'Cash' : null, 'paymentReceived': 0, 'paymentPending': this.f.netAmt.value });

      this.service.updateValidators({ 'formGroup': this.orderForm, 'formControls': ['paymentReceived'], 'validators': !value ? [Validators.required] : [] });

    });

    this.orderForm.get('pickupTimeSlot').valueChanges.subscribe((value: any) => {

      this.orderForm.patchValue({ 'pickupTimeSlotDet': _.omit(_.find(this.masterList['pickupDate']?.timeSlots, { '_id': value }),['is_active','_id']) || {} });

    });

    this.orderForm.get('expDeliveryTimeSlot').valueChanges.subscribe((value: any) => {

      this.orderForm.patchValue({ 'expDeliveryTimeSlotDet': _.omit(_.find(this.masterList['expDeliveryDate']?.timeSlots, { '_id': value }),['is_active','_id']) || {} });

    });    

  }

  loadCustomerForm({ data = {} }: { data?: any }) {

    this.customerForm = this.service.fb.group({

      'companyId': [ this.service?.companyDetails?._id, Validators.required],

      'firstName': [ null, Validators.required ],

      'lastName': [ null, Validators.required ],  

      'email': [ data.email || null, Validators.email ],

      'dialCode': [ null, [Validators.required]],

      'mobile': [ data.mobile || null, [Validators.required]],

      'gender': [ 'male' ],

      'customerType': 'POS',

      "verifiedDetails" : {

        "email" : false,

        "mobile" : false

      },

      'companies': [
      
        { 'companyId': this.service?.companyDetails?._id, 'customerType': 'POS' }
        
      ],

      'addressDetails': this.service.fb.group({

        'street': [ null, Validators.required ],

        'building': [ null ],

        'block': [ null ],

        'others': [ null ],

        'areaId': [ null, Validators.required ],

        'cityId': [ null, Validators.required ],

        'stateId': [ null, Validators.required ],

        'countryId': [ null, Validators.required ],

        'zipcode': [ null, Validators.required ],

        'isDefault': true

      })
      
    });

    // Listen to Country changes and update State, City, Area and zipcode

    this.adf['countryId'].valueChanges.subscribe((value: any) => {

      this.masterList = { ...this.masterList, 'stateList': [], 'cityList': [], 'areaList': [] };

      let countryDet = _.find(this.masterList['countryList'], { '_id': value });

      this.cusf.addressDetails.patchValue({ 'cityId': null, 'stateId': null, 'areaId': null, 'zipcode': null }, { emitEvent: false });

      if(countryDet.hasState) {

        this.adf['stateId'].setValidators([Validators.required]);

        this.getStates(); // Get States based on Country        

      } else this.adf['stateId'].setValidators([]);

      this.adf['stateId'].updateValueAndValidity({ emitEvent: false });

      this.getCities({ 'fieldName': 'countryId' }); // Get Cities based on Country

    });

    // Listen to State changes and update City, Area and zipcode

    this.adf['stateId'].valueChanges.subscribe((value: any) => {

      this.getCities({ 'fieldName': 'stateId' }); // Get Cities based on State

      this.masterList['areaList'] = []; // Reset Area List

      this.cusf.addressDetails.patchValue({ 'cityId': null, 'areaId': null, 'zipcode': null }, { emitEvent: false });

    });

    // Listen to City changes and update Area and zipcode

    this.adf['cityId'].valueChanges.subscribe((value: any) => {

      this.getAreas(); // Get Areas based on City

      this.cusf.addressDetails.patchValue({ 'areaId': null, 'zipcode': null });

    });

    // Listen to Area changes

    this.adf['areaId'].valueChanges.subscribe((value: any) => {

      this.cusf.addressDetails.patchValue({ 
        
        'zipcode': _.get(_.find(this.masterList['areaList'], { '_id': value }), 'zipcode', null) 
      
      });

    });        

  }

  loadAddressForm({ getAddressForm = false }: { getAddressForm?: boolean }) {

    this.addressForm = this.service.fb.group({

      'street': [ null, Validators.required ],

      'building': [ null ],

      'block': [ null ],

      'others': [ null ],
   
      'areaId': [ null, Validators.required ],

      'cityId': [ null, Validators.required ],

      'stateId': [ null, Validators.required ],

      'countryId': [ null, Validators.required ],

      'zipcode': [ null, Validators.required ],

      'isDefault': false

    });

    if(getAddressForm) return this.addressForm;

  }

  loadBasketForm({ productDet = {} }: {productDet?: any}) {

    this.basketForm = this.service.fb.group({

      'productId': [ productDet?._id || this.selectedItemDet?._id, Validators.required],

      'productName': [ productDet?.productName || this.selectedItemDet?.productId?.productName, Validators.required],

      'productImageURL': [productDet?.productImageURL || this.selectedItemDet?.productId?.productImageURL, Validators.required],

      'qty': [ productDet?.qty || null, Validators.required],

      'netAmt': [ productDet?.netAmt || 0, Validators.required],

      'priceList': this.service.fb.array([])

    });

    let priceList = productDet?.priceList || _.filter(this.selectedItemDet?.priceList,{ 'chargeType': this.f.orderType.value, 'is_active': true });

    _.map(priceList,(chargeDet:any, index: number)=>{

      chargeDet = { 
        
        ...chargeDet, 
        
        ..._.find(this.selectedItemDet.priceList, { 
          
          'chargeId': { '_id': _.isEmpty(productDet) ? chargeDet.chargeId?._id : chargeDet?.chargeId }, "chargeType": this.f.orderType.value || "normal"
        
        }) 
      
      };

      this.bf.priceList.push(this.service.fb.group({

        'chargeId': [chargeDet?.chargeId?._id, Validators.required],

        'chargeName': [chargeDet?.chargeId?.chargeName, Validators.required],

        'imgURL': [this.service.getFullImagePath({ 'imgUrl': chargeDet?.chargeId?.imgURL }), Validators.required],

        'amount': [ (chargeDet?.amount || 0).toCustomFixed(), Validators.required],

        'qty': [ chargeDet?.qty || 0, Validators.required],

        'netAmt': [ chargeDet?.netAmt || 0, Validators.required],

      }));

    });

  }    

  get f() { return this.orderForm.controls; }

  get itf(): any { return this.f.itemList as FormArray; }

  get bf() { return this.basketForm.controls; }

  get cusf() { return this.customerForm.controls; }

  get adf() { return this.cusf.addressDetails.controls; }

  get af() { return this.addressForm.controls; }

  searchCustomer() {
    
    // if email or phone number is empty
    if(_.isEmpty(this.f.searchCustomer.value)) { 
      return this.service.showToastr({ "data": { "message": "Please enter customer email or phone number", "type": "error" } });
    }
    // if email is invalid) // if email is invalid
    if(new RegExp('^[a-zA-Z]+$').test(this.f.searchCustomer.value) && new RegExp('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$').test(this.f.searchCustomer.value) == false) {
      return this.service.showToastr({ "data": { "message": "Please enter valid email address", "type": "error" } });
    }
    // if phone number is invalid
    if(!this.f.searchCustomer.value.includes('@') && new RegExp('^[0-9]{6,10}$').test(this.f.searchCustomer.value) == false) {
      return this.service.showToastr({ "data": { "message": "Please enter valid phone number", "type": "error" } });
    }

    let payload = this.f.searchCustomer.value.includes('@') ? { "email": this.f.searchCustomer.value } : { "mobile": this.f.searchCustomer.value };

    this.service.postService({ "url": "/master/customers", payload }).subscribe((res: any) => {

      if(res.status == 'ok') {

        if(_.isEmpty(res.data)) {

          this.orderForm.patchValue({ "customerDetails": null, "customerId": null, "isExistingCustomer": false });

          this.formSubmitted.customerSearched = true;

          this.loadCustomerForm({ "data": payload });
          
          return this.service.showToastr({ "data": { "message": `No customer found with this ${ _.first(_.keys(payload)) == 'email' ? 'Email Id' : 'Mobile No'  } `, "type": "error" } });

        } else {

          this.selectedCustomerDet = _.first(res.data);

          this.selectedCustomerDet['profileImg'] = _.isEmpty(this.selectedCustomerDet?.profileImg) ? './assets/images/customer-profile.svg' : this.service.getFullImagePath({ 'imgUrl': this.selectedCustomerDet?.profileImg });

          this.orderForm.get('selectedAddr').setValue(0);

          // this.selectedCustomerDet['addresses'] = _.map(new Array(5).fill(0),(e,i)=>this.selectedCustomerDet.addresses[i] || { ... _.first(this.selectedCustomerDet.addresses) as any, "selected": false });

          this.orderForm.patchValue({ 
            
            "customerDetails": this.selectedCustomerDet,

            "customerId": this.selectedCustomerDet._id,

            "isExistingCustomer": _.includes(_.map(this.selectedCustomerDet.companies,'companyId'),this.service.userDetails.companyId),

          });

        }

      }

    });

  }

  sendCustomerVerification({ newCustomer = false }: { newCustomer?: boolean}) {

    this.otp = ["", "", "", "", "", ""];

    if(newCustomer) {

      this.service.postService({ "url": "/master/customer/verification", "params": { type: "email" }, "payload": _.pick(this.customerForm.value,"email") }).subscribe((res: any) => {

        if(res.status == 'ok') {

          this.service.showToastr({ "data": { "message": "Verification email sent successfully", "type": "success" } });

          this.customerVerificationModal.open();

          this.startTimer();

        }

      });

    } else {

      this.service.postService({ "url": `/addCustomer/sendVerification/${this.f.customerId.value}`, "params": { "type": "email" } }).subscribe((res: any) => {

        if(res.status=='ok') {

          this.service.showToastr({ "data": { "message": "Verification email sent successfully", "type": "success" } });

          this.customerVerificationModal.open();

          this.startTimer();

        }

      }, (err: any) => {

        this.service.showToastr({ "data": { "message": err.error.message || "We are unable to send verification email at this moment", "type": "error" } });

      });

    }

  }

  startTimer() {

    this.timer = 60;

    let interval = setInterval(() => {

      this.timer--;

      if(this.timer == 0) clearInterval(interval);

    }, 1000);

  }

  verifyCustomerOtp() {

    if(!this.f.isExistingCustomer.value && _.isEmpty(this.f.customerDetails.value)) {

      let payload = _.cloneDeep(this.customerForm.value);
  
      payload['addresses'] = [payload['addressDetails']];
  
      delete payload['addressDetails'];
  
      this.service.postService({ "url": "/master/customer", "params": { "type": "email", "verificationCode": this.otp.join('') }, "payload": payload }).subscribe((res: any) => {
  
        if(res.status == "ok") {
  
          this.orderForm.patchValue({ "customerDetails": res.data, "customerId": res.data._id, "isExistingCustomer": true, "isCustomerVerified": true });
  
          this.selectedCustomerDet = res.data;
  
          this.canvas?.close();
  
          this.loadCustomerForm({});
  
          this.formSubmitted.customerSearched = false;
  
          this.service.showToastr({ "data": { "message": "Customer Created Successfully", "type": "success" } });
  
        }
  
      }, (err: any) => {
  
        this.service.showToastr({ "data": { "message": err?.error?.error || err?.error?.message || "Something went wrong", "type": "error" } });
  
      });

    } else {

      this.service.postService({ "url": `/addCustomer/otpVerify/${this.f.customerId.value}`, "params": { "type": "email" }, "payload": { "verificationCode": this.otp.join('') } }).subscribe((res: any) => {

        if(res.status=='ok') {

          this.service.showToastr({ "data": { "message": "Customer verified successfully", "type": "success" } });

          this.customerVerificationModal.close();

          this.orderForm.patchValue({ "isExistingCustomer": true });

        }
        
      }, (err: any) => {

        this.service.showToastr({ "data": { "message": err?.error?.error || err?.error?.message || "Something went wrong", "type": "error" } });
  
      });

    }

  }

  calculateOrderFormValue() {

    this.orderForm.patchValue({

      'qty': _.sumBy(this.itf.value,(e: any)=>parseFloat(e.qty)),

      'grossAmt': _.sumBy(this.itf.value,(e: any)=>parseFloat(e.netAmt)).toCustomFixed()

    });

    if(this.f.discType.value == 'percentage') this.f.discAmt.setValue(((parseFloat(this.f.discPercentage.value || 0)/100) * parseFloat(this.f.grossAmt.value)).toCustomFixed());

    else this.f.discPercentage.setValue(((parseFloat(this.f.discAmt.value || 0)/parseFloat(this.f.grossAmt.value)) * 100).toCustomFixed());      

    this.orderForm.patchValue({

      'discApplied': parseFloat(this.f.discAmt.value || 0) > 0,

      'netAmt': (parseFloat(this.f.grossAmt.value) - parseFloat(this.f.discAmt.value || 0)).toCustomFixed(),

    });

    this.selectedItems = _.map(this.itf.value,"productId");

    this.f.paymentPending.setValue(this.f.netAmt.value);

  }

  removeBasketItem({ productIndex = 0, priceIndex = 0 }: { productIndex: number, priceIndex: number }) {

    this.itf.at(productIndex).get('priceList').at(priceIndex).patchValue({ 'qty': 0, 'netAmt': 0 });

    this.itf.at(productIndex).patchValue({ 

      'qty': _.sumBy(this.itf.at(productIndex).value.priceList,(e: any)=>parseFloat(e.qty)),
      
      'netAmt': _.sumBy(this.itf.at(productIndex).value.priceList,(e: any)=>parseFloat(e.netAmt)).toCustomFixed()
    
    });

    if(_.every(this.itf.at(productIndex).value.priceList,(e: any)=>e.qty == 0)) this.itf.removeAt(productIndex);

    this.calculateOrderFormValue();

    if(this.itf.length == 0) this.goNext({ "nextStep": 2 });

  }

  changeValue({ fieldName, index = 0, indexTwo = 0, data }: { fieldName: string, index?: number, indexTwo?: number, data?: any }) {

    if(fieldName == 'qty') {

      const priceForm = this.bf.priceList.at(index);

      let qty = priceForm.value.qty + data;

      if(qty < 0) return this.service.showToastr({ "data": { "message": "Quantity should be greater than or equal to 0", "type": "info" } })

      else if(qty > 50) return this.service.showToastr({ "data": { "message": "Quantity should be less than or equal to 50", "type": "info" } })

      this.bf.priceList.at(index).patchValue({ 
        
        'qty': qty,

        'netAmt': (qty * parseFloat(priceForm.value.amount)).toCustomFixed() 
      
      });

      this.basketForm.patchValue({ 

        'qty': _.sumBy(this.bf.priceList.value,(e: any)=>parseFloat(e.qty)),
        
        'netAmt': _.sumBy(this.bf.priceList.value,(e: any)=>parseFloat(e.netAmt)) 
      
      });

      this.canvasConfig['applyBtnTxt'] = this.canvasConfig['applyBtnTxt'].split('(')[0] + (this.basketForm.value.qty > 0 ? `(${this.basketForm.value.qty})` : '');

    } else if(fieldName == 'orderType') {

      this.f.orderType.setValue(this.f.orderType.value ? 'normal' : 'urgent');

      _.forEach(this.itf.value, (elem: any, i: number) => {

        let itemDet = _.find(this.masterList['agentProducts'], { '_id': elem.productId });

        _.forEach(elem.priceList,(priceDet:any, index: number)=>{

          let itemPriceDet = _.find(itemDet?.priceList, { 'chargeId': { '_id': priceDet.chargeId }, 'chargeType': this.f.orderType.value });

          this.itf.at(i).get('priceList').at(index).patchValue({

            'amount': (itemPriceDet?.amount || 0).toCustomFixed(),

            'netAmt': ((itemPriceDet?.amount || 0) * parseFloat(priceDet.qty)).toCustomFixed()

          });

        });

        this.itf.at(i).patchValue({

          'netAmt': _.sumBy(this.itf.at(i).value.priceList,(e: any)=>parseFloat(e.netAmt)).toCustomFixed()

        });

      });

      this.calculateOrderFormValue();

    } else if(fieldName == 'paymentReceived') {

      if(parseFloat(this.f.paymentReceived.value) > parseFloat(this.f.netAmt.value)) {
        
        this.f.paymentReceived.setValue(this.f.netAmt.value);

        this.service.showToastr({ "data": { "message": "Payment received amount should be less than or equal to net amount", "type": "info" } });

      }

      this.orderForm.patchValue({ 'paymentPending': (parseFloat(this.f.netAmt.value) - parseFloat(this.f.paymentReceived.value || 0)).toCustomFixed() });

    } else if(fieldName == 'productQty') {

      this.itf.at(index).get('priceList').at(indexTwo).patchValue({ 'qty': parseFloat(this.itf.at(index).get('priceList').at(indexTwo).value.qty) });

      this.itf.at(index).get('priceList').at(indexTwo).patchValue({ 'netAmt': (parseFloat(this.itf.at(index).get('priceList').at(indexTwo).value.qty) * parseFloat(this.itf.at(index).get('priceList').at(indexTwo).value.amount)).toCustomFixed() });

      this.itf.at(index).patchValue({ 

        'netAmt': _.sumBy(this.itf.at(index).value.priceList,(e: any)=>parseFloat(e.netAmt)).toCustomFixed()

      });

      this.calculateOrderFormValue();

    }

  }  

  openAsidebar({ canvasName = 'addCustomer', data = {} }:  { canvasName: 'addCustomer' | 'addBasket' | 'addDiscount', data?: any }) {

    this.canvasConfig['canvasName'] = canvasName;

    this.canvasConfig['applyBtnTxt'] = 'Save';

    this.canvasConfig['cancelBtnTxt'] = 'Clear';

    this.canvasConfig['showCancelBtn'] = true;
    
    this.openCanvas = true;

    if(canvasName == 'addBasket') {

      this.selectedItemDet = data;

      const productDet = _.find(this.f.itemList.value,{ 'productId': data._id }) || {};

      this.canvasConfig['canvasTitle'] = `${_.isEmpty(productDet) ? 'Add New' : 'Update Existing' } Item`;

      this.canvasConfig['applyBtnTxt'] = `${_.isEmpty(productDet) ? 'Add to Basket' : 'Update in Basket' }`;

      this.canvasConfig['cancelBtnTxt'] = `${_.isEmpty(productDet) ? 'Clear' :  'Remove Item' }`;
      
      this.loadBasketForm({ productDet });

    } else if(canvasName == 'addCustomer') {

      this.canvasConfig['canvasTitle'] = 'Add Customer';

      this.formSubmitted['customerForm'] = false;
      
    } else if(canvasName == 'addDiscount') {

      this.canvasConfig['canvasTitle'] = 'Apply Discount';
      
      this.canvasConfig['applyBtnTxt'] = 'Apply Discount';

      this.canvasConfig['showCancelBtn'] = false;
    
    }

  }

  asidebarCancel() {
  
    if(this.canvasConfig['canvasName'] == 'addBasket') {

      let itemIndex = _.findIndex(this.itf.value, { 'productId': this.basketForm.value.productId });

      if(itemIndex >= 0) {

        this.itf.removeAt(itemIndex);

        this.calculateOrderFormValue();

        this.service.showToastr({ "data": { "message": "Item removed from basket", "type": "success" } });

      }

    }

    this.canvas?.close();

  }

  asidebarSubmit() {

    if(this.canvasConfig['canvasName'] == 'addCustomer') {

      this.formSubmitted.customerForm = true;

      if(this.customerForm.invalid) return;
  
      this.sendCustomerVerification({ "newCustomer": true });

    } else if(this.canvasConfig['canvasName'] == 'addBasket') {

      if(this.basketForm.value.qty <= 0) return this.service.showToastr({ "data": { "message": "Please select atleast one item", "type": "info" } });

      let itemIndex = _.findIndex(this.itf.value, { 'productId': this.basketForm.value.productId });

      if(itemIndex > -1 ) {

        this.itf.removeAt(itemIndex);
        
        this.itf.insert(itemIndex,this.basketForm);

      }

      else this.itf.push(this.basketForm);

      this.calculateOrderFormValue();

      this.service.showToastr({ "data": { "message": `Item ${ itemIndex > -1 ? 'added to basket' : 'Updated in basket' }`, "type": "success" } });

      this.canvas?.close();

    } else if(this.canvasConfig['canvasName'] == 'addDiscount') {

      this.canvas?.close();

    }

  }

  goNext({ nextStep = 1 }: { nextStep: number }) {

    if(_.isEmpty(this.f.customerDetails.value)) {

      this.step = 0;
      
      return this.service.showToastr({ "data": { "message": "Please select customer", "type": "info" } });

    } else if(this.f.selectedAddr.value == -1) {

      this.step = 1;

      return this.service.showToastr({ "data": { "message": "Please select address", "type": "info" } });

    } else if(this.itf.value.length == 0) {

      this.step = 2;

      return this.service.showToastr({ "data": { "message": "Please add items to basket", "type": "info" } });

    }

    this.step = nextStep;

  }

  submit() {

    this.formSubmitted.orderForm = true;

    const formValue = this.orderForm.value;

    if(_.isEmpty(this.selectedCustomerDet)) {

      this.step = 0;
      
      return this.service.showToastr({ "data": { "message": "Please select customer", "type": "info" } });

    } else if(formValue.qty <= 0) {

      this.step = 2;
      
      return this.service.showToastr({ "data": { "message": "Please select atleast one item", "type": "info" } });

    } else if(_.isEmpty(formValue.expDeliveryTimeSlot) || (formValue.isPickupAvailable && _.isEmpty(formValue.pickupTimeSlot))) {

      this.step = 3;

      if(_.isEmpty(formValue.expDeliveryTimeSlot)) return this.service.showToastr({ "data": { "message": "Please select expected delivery time slot", "type": "info" } });

      if(formValue.isPickupAvailable && _.isEmpty(formValue.pickupTimeSlot)) return this.service.showToastr({ "data": { "message": "Please select pickup time slot", "type": "info" } });

    }

    this.f.paymentReceived.setValue((0).toCustomFixed());

    this.orderPreviewModal?.open();

  }  

  createOrder() {

    if(parseFloat(this.f.paymentReceived.value) == 0 && !this.f.paymentOnDelivery.value) 
    
      return this.service.showToastr({ "data": { "message": "Please enter received payment amount", "type": "info" } });

    if(this.orderForm.invalid) return;

    this.confirmationDialog.confirm({ 
      
      type: "info", message: 'Are you sure, you want to create order?',
    
    }).then((confirmed) => {

      if (confirmed) {

        let payload: any = _.omit(_.cloneDeep(this.orderForm.value),["searchCustomer","isExistingCustomer"]);

        payload['itemList'] = _.flatten(_.map(payload.itemList,(itemDet)=>{
    
          return _.map(itemDet.priceList,(priceDet)=>({ "productId": itemDet.productId, ..._.omit(priceDet,["imgURL","chargeName"]) }))
          
        }))
    
        payload['itemList'] = _.filter(payload.itemList,(itemDet)=>itemDet.qty > 0);
    
        if(!payload.paymentOnDelivery) payload['paymentList'] = [{
    
          "isAdvance": true,
    
          "paymentMode": payload.paymentMode,
    
          "paymentDate": moment().format('YYYY-MM-DD'),
    
          "transactionStatus": "Success",
    
          "amount": payload.paymentReceived
    
        }];
    
        payload = _.omit(payload,["paymentMode","paymentOnDelivery"]);
    
        payload['paymentStatus'] = parseFloat(payload.paymentReceived) == 0 ? 'Unpaid' : parseFloat(payload.paymentReceived) >= parseFloat(payload.netAmt) ? 'Paid' : 'Partly Paid';
    
        payload['addressDetails'] = _.omit(payload.customerDetails.addresses[payload.selectedAddr],['isDefault']);

        payload['addressDetails'] = {

          ...payload['addressDetails'],

          'areaId': payload['addressDetails']['areaId']._id,

          'cityId': payload['addressDetails']['cityId']._id,

          'stateId': payload['addressDetails']['stateId']._id,

          'countryId': payload['addressDetails']['countryId']._id

        };

        payload["orderMode"] = "POS";

        payload['expDeliveryTimeSlotDet'] = _.pick(payload.expDeliveryTimeSlotDet,["startTime","endTime","day","label","session"]);
    
        payload['pickupTimeSlotDet'] = _.pick(payload.pickupTimeSlotDet,["startTime","endTime","day","label","session"]);
    
        payload = _.omit(payload,["searchCustomer","customerDetails","selectedAddr"]);
    
        this.service.postService({ "url": "/agent/order", "payload": payload }).subscribe((res: any) => {
    
          if(res.status == "ok") {
    
            this.orderPreviewModal?.close();
    
            this.service.showToastr({ "data": { "message": "Order Created Successfully", "type": "success" } });

            this.formSubmitted = { "orderForm": false, "customerForm": false, "customerSearched": false };
    
            this.loadForm();
    
            this.loadCustomerForm({});
    
            this.loadBasketForm({});
    
          }
    
        }, (err: any) => {
    
          this.service.showToastr({ "data": { "message": err?.error?.error || err?.error?.message || "Something went wrong", "type": "error" } });
    
        });    

      }

    });


  }


  keydown({ event = {}, nextElement = "", prevElement = "" }: { event: any, nextElement?: string, prevElement?: string}) {

  //   if(nextElement == "#otp-submit") {

  //     if(this.otp.length == 6 && _.every(this.otp, (o: any) => o != '')) return this.verifyCustomerOtp();

  //   }
    
  //   if(_.includes(['ArrowLeft','ArrowRight'],event.key) && _.isEmpty(nextElement)) return;

  //   if(event.key == 'Tab' && event.shiftKey || event.key == 'Shift') return;

  //   if(event.key == 'Tab' && event.target.value == '') return event.preventDefault();

  //   if(event.key == 'Backspace' || event.key == 'Delete') {

  //     return setTimeout(()=>{

  //       $(`#otp-inp-${prevElement}`).focus();

  //     },100);

  //   }

  //   setTimeout(() => {

  //     $(nextElement).focus();

  //   }, 100);

  }  

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if(this.userSubscribe) this.userSubscribe.unsubscribe();
  }  

}

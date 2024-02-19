import { Component, ViewChild } from '@angular/core';
import { FormArray, Validators } from '@angular/forms';
import { ModalComponent, OffcanvasComponent } from '@shared/components';
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
  selectedCustomerDet: any;
  agentProductsCount: any = 0;

  constructor(public service: CommonService) { 

    this.filterForm = this.service.fb.group({ 'categoryId': [] });

    if(!_.isEmpty(this.service.companyDetails)) {

      this.loadForm();
      this.loadCustomerForm();
      this.loadBasketForm({});
      this.getBasicDetails();

    } else {

      this.userSubscribe = this.service.userDetailsObs.subscribe((value) => {

        if (!_.isEmpty(value)) {
  
          this.loadForm();
          this.loadCustomerForm();
          this.loadBasketForm({});
          this.getBasicDetails();
        }
  
      });      

    }

  }

  ngOnInit(): void {

    this.loadForm();
    this.loadCustomerForm();
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

      this.getMyProducts({});

    });

  }

  getMyProducts({ searchValue = "" }: { searchValue?: string }) {

    let params = { searchValue };

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

  loadForm() {

    this.orderForm = this.service.fb.group({

      'searchCustomer': ['gowthamkannan2g@gmail.com'],

      'customerDetails': this.editData?.customerId || null,

      'customerId': [ this.editData?.customerId?._id ||'', Validators.required],

      'isExistingCustomer': this.mode == 'Update',

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

  loadCustomerForm() {

    this.customerForm = this.service.fb.group({

      'firstName': [ null, Validators.required ],

      'lastName': [ null, Validators.required ],  

      'email': [ null, Validators.email ],

      'dialCode': [ null, [Validators.required]],

      'mobile': [ null, [Validators.required]],

      'gender': [ 'male' ],

      'customerType': 'POS',

      'companies': [
      
        { 'companyId': this.service?.companyDetails?._id, 'customerType': 'POS' }
        
      ],

      'addressDetails': this.loadAddressForm({ 'getAddressForm': true })
      
    });

    this.cusf.addressDetails.patchValue({ "isDefault": true });

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

  get adf() { return this.cusf.get('addressDetails').controls; }

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
          
          return this.service.showToastr({ "data": { "message": `No customer found with this ${ _.first(_.keys(payload)) == 'email' ? 'Email Id' : 'Mobile No'  } `, "type": "error" } });

        } else {

          this.selectedCustomerDet = _.first(res.data);

          this.selectedCustomerDet['addresses'] = _.map(this.selectedCustomerDet.addresses,(e)=>({ ...e, "selected": e.isDefault }));

          this.selectedCustomerDet['addresses'] = _.map(new Array(5).fill(0),(e,i)=>this.selectedCustomerDet.addresses[i] || { ... _.first(this.selectedCustomerDet.addresses) as any, "selected": false });

          this.orderForm.patchValue({ 
            
            "customerDetails": this.selectedCustomerDet,

            "customerId": this.selectedCustomerDet._id,

            "isExistingCustomer": _.includes(_.map(this.selectedCustomerDet.companies,'companyId'),this.service.userDetails.companyId),

          });

        }

      }

    });

  }

  addNewCustomer() {

  }

  sendCustomerVerification({ newCustomer = false }: { newCustomer?: boolean}) {

    if(newCustomer) {


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


    } else {

      this.service.postService({ "url": `/addCustomer/otpVerify/${this.f.customerId.value}`, "params": { "type": "email" }, "payload": { "verificationCode": this.otp.join('') } }).subscribe((res: any) => {

        if(res.status=='ok') {

          this.service.showToastr({ "data": { "message": "Customer verified successfully", "type": "success" } });

          this.customerVerificationModal.close();

          this.orderForm.patchValue({ "isExistingCustomer": true });

        }
        
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

    this.f.paymentPending.setValue(this.f.netAmt.value);

  }

  changeValue({ fieldName, index = 0, data }: { fieldName: string, index?: number, data?: any }) {

    if(fieldName == 'qty') {

      const priceForm = this.bf.priceList.at(index);

      let qty = priceForm.value.qty + data;

      qty = qty < 0 ? 0 : qty;

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
      
      this.loadCustomerForm();

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
  
      let payload = _.cloneDeep(this.customerForm.value);
  
      payload['addresses'] = [payload['addressDetails']];
  
      delete payload['addressDetails'];
  
      this.service.postService({ "url": "/master/customer", "payload": payload }).subscribe((res: any) => {
  
        if(res.status == "ok") {

          this.orderForm.patchValue({ "customerDetails": res.data, "customerId": res.data._id, "isExistingCustomer": true, "isCustomerVerified": true });
  
          this.canvas?.close();
  
          this.service.showToastr({ "data": { "message": "Customer Created Successfully", "type": "success" } });
  
        }
  
      }, (err: any) => {
  
        this.service.showToastr({ "data": { "message": err?.error?.message || "Something went wrong", "type": "error" } });
  
      });

    } 

  }

  createOrder() {

    if(parseFloat(this.f.paymentReceived.value) == 0 && !this.f.paymentOnDelivery.value) 
    
      return this.service.showToastr({ "data": { "message": "Please enter received payment amount", "type": "info" } });

    if(this.orderForm.invalid) return;

    let payload: any = _.omit(_.cloneDeep(this.orderForm.value),["searchCustomer"]);

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

    this.service.postService({ "url": "/agent/order", "payload": payload }).subscribe((res: any) => {

      if(res.status == "ok") {

        this.orderPreviewModal?.close();

        this.service.showToastr({ "data": { "message": "Order Created Successfully", "type": "success" } });

        this.loadForm();

        this.loadCustomerForm();

        this.loadBasketForm({});

      }

    }, (err: any) => {

      this.service.showToastr({ "data": { "message": err?.error?.message || "Something went wrong", "type": "error" } });

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

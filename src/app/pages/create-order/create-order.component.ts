import { Component, ViewChild } from '@angular/core';
import { FormArray, Validators } from '@angular/forms';
import { ModalComponent, OffcanvasComponent } from '@shared/components';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-create-order',
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.scss']
})
export class CreateOrderComponent {

  @ViewChild('canvas') canvas: OffcanvasComponent | undefined;
  @ViewChild('orderPreviewModal') orderPreviewModal: ModalComponent | undefined;

  selectedCustomerDet: any = {};
  selectedItemDet: any = {};
  customerDetail!: any;
  agentProductsCount: number = 0;
  userSubscribe: any;
  _: any = _;
  filterForm: any = this.service.fb.group({
    'search': '',
    'category': null
  });
  productForm: any;
  orderForm: any;
  customerForm: any;
  basketForm: any;
  openCanvas: any = false;
  canvasConfig: any = {
    "canvasName": "addCustomer",
    "canvasTitle": "Add Customer",
    "applyBtnTxt": "Save",
    "cancelBtnTxt": "Clear",
    "showCancelBtn": true
  }
  masterList: any = {
    dialCodeList: [],
    countryList: [],
    stateList: [],
    cityList: [],
    areaList: [],
    customerList: [],
    productCharges: [],
    categoryList: []
  };
  formSubmitted: any = {
    customerForm: false,
    productForm: false,
    orderForm: false
  };
  moment: any = moment;
    
  constructor(public service: CommonService) {

    this.service.setApiLoaders({ 'isLoading': true, 'url': [
      '/master/productCharges', '/setup/agentProducts', '/address/countries', '/address/dialCode', '/master/categories', '/master/customers'
    ] });

    this.getBaseDetails();

    if(!_.isEmpty(this.service.companyDetails)) {

      this.loadForm();
      this.loadProductForm();
      this.loadCustomerForm();
      this.loadBasketForm({});
      this.getMyProducts();
      this.getCustomers();

    } else {

      this.userSubscribe = this.service.userDetailsObs.subscribe((value) => {

        if (!_.isEmpty(value)) {
  
          this.loadForm();
          this.loadProductForm();
          this.loadCustomerForm();
          this.loadBasketForm({});
          this.getCustomers();
  
        }
  
      });      

    }

  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.loadForm();
    this.loadProductForm();
    this.loadCustomerForm();
    this.loadBasketForm({});

  }

  getBaseDetails() {

    forkJoin({

      "countries": this.service.getService({ "url": "/address/countries" }),

      "dialCodes": this.service.getService({ "url": "/address/dialCode" }),

      "categories": this.service.postService({ "url": "/master/categories" }),

      "charges": this.service.getService({ "url": "/master/productCharges" }),

    }).subscribe((res: any) => {

      this.masterList["countryList"] = res.countries.status == "ok" ? res.countries.data : [];

      this.masterList["dialCodeList"] = res.dialCodes.status == "ok" ? res.dialCodes.data : [];

      this.masterList["categoryList"] = res.categories.status == "ok" ? res.categories.data : [];

      this.getMyProducts();

      if(res.charges.status == "ok") {

        this.masterList['productCharges'] = res.charges.data;

        this.masterList['productCharges'] = _.flatten(_.map(this.masterList['productCharges'], (obj: any) => {

          obj.chargeType = 'normal';

          let obj2 = { ..._.cloneDeep(obj), chargeType: 'urgent' };
          
          return [obj, obj2];

        }));

        this.loadProductForm();

      }

    });

  }

  getWorkingHours(fieldName: string) {

    const timeFieldName = fieldName == 'pickupDate' ? 'pickupTimeSlot' : 'expDeliveryTimeSlot';

    if(this.f.pickupDate.value && this.f.expDeliveryDate.value && moment(this.f.pickupDate.value).isAfter(this.f.expDeliveryDate.value)) {

      this.orderForm.patchValue({ [fieldName]: null, [timeFieldName]: null, [timeFieldName+'Det']: null });

      if(fieldName == 'pickupDate') return this.service.showToastr({ "data": { "message": "Pickup date should be less than or equal to expected delivery date", "type": "info" } });

      return this.service.showToastr({ "data": { "message": "Expected delivery date should be greater than or equal to pickup date", "type": "info" } });

    }

    if(moment(this.f[fieldName].value).format('dddd') == 'Invalid date') return this.orderForm.patchValue({ [fieldName]: null, [timeFieldName]: null, [timeFieldName+'Det']: null });

    let payload = { "day": moment(this.f[fieldName].value).format('dddd'), "date": this.f[fieldName].value };

    this.masterList[fieldName] = {

      'workingHours': {},

      'timeSlots': []

    };

    this.service.postService({ "url": "/master/workingHours", payload }).subscribe((res: any) => {

      if(res.status == "ok") {

        if(res.data.is_active) {

          this.masterList[fieldName]['workingHours'] = res.data;

          this.masterList[fieldName]['timeSlots'] = res.data?.timeSlots || [];

          if(_.size(this.masterList[fieldName]['timeSlots']) == 0) {

            this.service.showToastr({ "data": { "message": "Please add time slots for selected day", "type": "info" } });

            this.orderForm.patchValue({ [fieldName]: null, [timeFieldName]: null, [timeFieldName+'Det']: null });

          }

        } else {

          this.masterList[fieldName]['workingHours'] = {};

          this.masterList[fieldName]['timeSlots'] = [];

          this.service.showToastr({ "data": { "message": "Selected date is not a working day", "type": "info" } });

          this.orderForm.patchValue({ [fieldName]: null, [timeFieldName]: null, [timeFieldName+'Det']: null });

        }

      }

    });

  }

  getCustomers() {

    this.service.postService({ "url": "/master/customers", "payload": { "companyId": this.service.companyDetails._id } }).subscribe((res: any) => {

      if(res.status == "ok") {

        this.masterList['customerList'] = _.concat([],_.map(res.data, (e: any) => {

          e.customerImageURL = _.isEmpty(e?.customerImageURL) ? './assets/images/customer-profile.svg' : this.getFullImagePath(e?.customerImageURL);

          e.addressInfo = _.find(e.addresses, { 'isDefault': true });
          
          return e;
  
        }));

      }

    });

  }

  getMyProducts() {

    this.service.postService({ "url": "/setup/agentProducts", "payload": { "categoryId": _.map(this.masterList['categoryList'],'_id') } }).subscribe((res: any) => {

      if(res.status == "ok") {

        this.masterList['agentProducts'] = res.data;

        this.masterList['agentProducts'] = _.map(this.masterList['agentProducts'], (e: any) => {
  
          e.productId.productImageURL = this.getFullImagePath(e?.productId?.productImageURL);
          
          return e;
  
        });
  
        this.agentProductsCount = res.totalCount;

      }

    });

  }

  getFullImagePath(imgUrl: any): string {
    // Replace backslashes with forward slashes
    const imagePath = imgUrl.replace(/\\/g, '/');
    return (this.service.IMG_BASE_URL + imagePath).toString();
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

      this.masterList['cityList'] = res.status=='ok' ? res.data : [];

    });

  }

  // Get Areas based on City
  getAreas() {

    this.service.getService({ "url": `/address/areas/${this.af.cityId.value}` }).subscribe((res: any) => {

      this.masterList['areaList'] = res.status=='ok' ? res.data : [];

    });

  }  

  loadForm() {

    this.orderForm = this.service.fb.group({

      'companyId': [ this.service.companyDetails._id, Validators.required],

      'customerId': [ null, Validators.required],

      "orderDate": [moment().format('YYYY-MM-DD')],

      "currencyId": [this.service.currencyDetails._id],

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

    });

    this.orderForm.get("pickupAvailable").valueChanges.subscribe((value: any) => {

      this.orderForm.patchValue({ 'pickupDate': null, 'pickupTimeSlot': null, 'pickupTimeSlotDet': null });

      if(value) {

        this.f.pickupDate.setValue(moment().format('YYYY-MM-DD'));
        
        this.getWorkingHours('pickupDate');

      }

      this.service.updateValidators({ 'formGroup': this.orderForm, 'formControls': ['pickupDate', 'pickupTimeSlot'], 'validators': value ? [Validators.required] : [] });

    });

    // this.orderForm.get("deliveryAvailable").valueChanges.subscribe((value: any) => {

    //   this.orderForm.patchValue({ 'expDeliveryDate': null, 'expDeliveryTimeSlot': null, 'expDeliveryTimeSlotDet': null });

    //   if(value) {

    //     this.f.expDeliveryDate.setValue(moment().format('YYYY-MM-DD'));

    //     this.getWorkingHours('expDeliveryDate');

    //   } 

    //   this.service.updateValidators({ 'formGroup': this.orderForm, 'formControls': ['expDeliveryDate', 'expDeliveryTimeSlot'], 'validators': value ? [Validators.required] : [] });

    // });

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

  loadProductForm() {

    this.productForm = this.service.fb.group({

      'productId': [ null, Validators.required],

      'companyId': [ this.service.companyDetails._id, Validators.required],

      'priceList': this.service.fb.array([])

    });

    _.map(this.masterList['productCharges'],(chargeDet:any, index: number)=>{

      this.cf.push(this.getChargeForm({ chargeDet }));

      this.changeValue({ fieldName: 'is_active', index });

    });

  }

  getChargeForm({ chargeDet = {} }: { chargeDet: any })  {

    return this.service.fb.group({

      '_id': [chargeDet._id || null],

      'chargeId': [chargeDet.chargeId?._id || chargeDet._id, Validators.required],

      'chargeName': [chargeDet.chargeId?.chargeName || chargeDet.chargeName, Validators.required],

      'imgURL': [this.getFullImagePath(chargeDet.chargeId?.imgURL || chargeDet.imgURL), Validators.required],

      'amount': [ (chargeDet.amount || 0).toCustomFixed(), Validators.required],

      'chargeType': [chargeDet?.chargeType || chargeDet.chargeType || 'normal', Validators.required],

      'is_active': [true],

    });

  }

  loadBasketForm({ productDet = {} }: {productDet?: any}) {

    this.basketForm = this.service.fb.group({

      'productId': [ productDet?._id || this.selectedItemDet?._id, Validators.required],

      'productName': [ productDet?.productName || this.selectedItemDet.productId?.productName, Validators.required],

      'productImageURL': [productDet?.productImageURL || this.selectedItemDet.productId?.productImageURL, Validators.required],

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

        'imgURL': [this.getFullImagePath(chargeDet?.chargeId?.imgURL), Validators.required],

        'amount': [ (chargeDet?.amount || 0).toCustomFixed(), Validators.required],

        'qty': [ chargeDet?.qty || 0, Validators.required],

        'netAmt': [ chargeDet?.netAmt || 0, Validators.required],

      }));

    });

  }  

  loadCustomerForm() {

    this.customerForm = this.service.fb.group({

      'companyId': [ this.service?.companyDetails?._id, Validators.required],

      'firstName': [ null, Validators.required ],

      'lastName': [ null, Validators.required ],  

      'email': [ null, Validators.email ],

      'dialCode': [ null, [Validators.required]],

      'mobile': [ null, [Validators.required]],

      'gender': [ 'male' ],

      'customerType': 'pos',

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

    this.af['countryId'].valueChanges.subscribe((value: any) => {

      this.masterList = { ...this.masterList, 'stateList': [], 'cityList': [], 'areaList': [] };

      let countryDet = _.find(this.masterList['countryList'], { '_id': value });

      this.cusf.addressDetails.patchValue({ 'cityId': null, 'stateId': null, 'areaId': null, 'zipcode': null }, { emitEvent: false });

      if(countryDet.hasState) {

        this.af['stateId'].setValidators([Validators.required]);

        this.getStates(); // Get States based on Country        

      } else this.af['stateId'].setValidators([]);

      this.af['stateId'].updateValueAndValidity({ emitEvent: false });

      this.getCities({ 'fieldName': 'countryId' }); // Get Cities based on Country

    });

    // Listen to State changes and update City, Area and zipcode

    this.af['stateId'].valueChanges.subscribe((value: any) => {

      this.getCities({ 'fieldName': 'stateId' }); // Get Cities based on State

      this.masterList['areaList'] = []; // Reset Area List

      this.cusf.addressDetails.patchValue({ 'cityId': null, 'areaId': null, 'zipcode': null }, { emitEvent: false });

    });

    // Listen to City changes and update Area and zipcode

    this.af['cityId'].valueChanges.subscribe((value: any) => {

      this.getAreas(); // Get Areas based on City

      this.cusf.addressDetails.patchValue({ 'areaId': null, 'zipcode': null });

    });

    // Listen to Area changes

    this.af['areaId'].valueChanges.subscribe((value: any) => {

      this.cusf.addressDetails.patchValue({ 
        
        'zipcode': _.get(_.find(this.masterList['areaList'], { '_id': value }), 'zipcode', null) 
      
      });

    });    

  }

  get f(): any { return this.orderForm.controls; }

  get itf(): any { return this.f.itemList as FormArray; }

  get pf(): any { return this.productForm.controls; }

  get cf(): any { return this.pf.priceList as FormArray; }

  get cusf(): any { return this.customerForm.controls; }

  get af(): any { return this.cusf.addressDetails.controls; }

  get bf(): any { return this.basketForm.controls; }

  openAsidebar({ canvasName = 'addCustomer', data = {} }:  { canvasName: 'addCustomer' | 'addProduct' | 'addBasket' | 'addDiscount', data?: any }) {

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
    
    } else if(canvasName == 'addProduct') {

      this.canvasConfig['canvasTitle'] = 'Add Product';

      this.formSubmitted['productForm'] = false;
      
      this.loadProductForm();

    } 

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

    } else if(fieldName == 'is_active') {

      if(!this.cf.at(index).value.is_active) {

        this.cf.at(index).get('amount').setValue(null);

        this.cf.at(index).get('amount').setValidators([]);

        this.cf.at(index).get('amount').disable();

      } else {

        this.cf.at(index).get('amount').enable();

        this.cf.at(index).get('amount').setValidators([Validators.required]);

      }

      this.cf.at(index).get('amount').updateValueAndValidity();

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
  
  asidebarSubmit() {

    if(this.canvasConfig['canvasName'] == 'addCustomer') {

      this.formSubmitted.customerForm = true;

      if(this.customerForm.invalid) return;
  
      let payload = _.cloneDeep(this.customerForm.value);
  
      payload['addresses'] = [payload['addressDetails']];
  
      delete payload['addressDetails'];
  
      this.service.postService({ "url": "/master/customer", "payload": payload }).subscribe((res: any) => {
  
        if(res.status == "ok") {
  
          this.masterList['customerList'].push(res.data);
  
          this.selectedCustomerDet = res.data;
  
          this.canvas?.close();
  
          this.getCustomers();
  
          this.service.showToastr({ "data": { "message": "Customer Created Successfully", "type": "success" } });
  
        }
  
      }, (err: any) => {
  
        this.service.showToastr({ "data": { "message": err?.error?.message || "Something went wrong", "type": "error" } });
  
      });

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

    } else if(this.canvasConfig['canvasName'] == 'addProduct') {


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

  asidebarCancel() {

    if(this.canvasConfig['canvasName'] == 'addCustomer') {

      this.canvas?.close();

    } else if(this.canvasConfig['canvasName'] == 'addProduct') {

      this.canvas?.close();

    } else if(this.canvasConfig['canvasName'] == 'addBasket') {

      let itemIndex = _.findIndex(this.itf.value, { 'productId': this.basketForm.value.productId });

      if(itemIndex >= 0) {

        this.itf.removeAt(itemIndex);

        this.calculateOrderFormValue();

        this.service.showToastr({ "data": { "message": "Item removed from basket", "type": "success" } });

        this.canvas?.close();

      } else this.canvas?.close();

    }

  }

  submit() {

    this.formSubmitted.orderForm = true;

    if(this.orderForm.value.customerId == null) return this.service.showToastr({ "data": { "message": "Please select customer", "type": "info" } });

    else if(this.orderForm.value.qty <= 0) return this.service.showToastr({ "data": { "message": "Please select atleast one item", "type": "info" } });

    else if(this.orderForm.invalid) return console.log(this.orderForm);

    this.f.paymentReceived.setValue((0).toCustomFixed());

    this.orderPreviewModal?.open();

  }

  createOrder() {

    if(parseFloat(this.f.paymentReceived.value) == 0 && !this.f.paymentOnDelivery.value) 
    
      return this.service.showToastr({ "data": { "message": "Please enter received payment amount", "type": "info" } });

    if(this.orderForm.invalid) return;

    let payload = _.cloneDeep(this.orderForm.value);

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

        this.loadProductForm();

        this.loadCustomerForm();

        this.loadBasketForm({});

      }

    }, (err: any) => {

      this.service.showToastr({ "data": { "message": err?.error?.message || "Something went wrong", "type": "error" } });

    });

  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.userSubscribe.unsubscribe();
  }  

}
import { Component, ViewChild } from '@angular/core';
import { FormArray, Validators } from '@angular/forms';
import { OffcanvasComponent } from '@shared/components';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-create-order',
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.scss']
})
export class CreateOrderComponent {

  @ViewChild('canvas') canvas: OffcanvasComponent | undefined;

  agentProdcuts!: Array<any>;
  otherProducts: Array<any> = [];
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
    "showCloseBtn": true
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
    
  constructor(public service: CommonService) {

    this.service.setApiLoaders({ 'isLoading': true, 'url': [
      '/master/productCharges', '/master/agentProducts', '/master/otherProducts', '/address/countries', '/address/dialCode', '/master/categories', '/master/customers'
    ] });

    this.getBaseDetails();

    if(!_.isEmpty(this.service.companyDetails)) {

      this.loadForm();
      this.loadProductForm();
      this.loadCustomerForm();
      this.loadBasketForm({});
      this.getMyProducts();

    } else {

      this.userSubscribe = this.service.userDetailsObs.subscribe((value) => {

        if (!_.isEmpty(value)) {
  
          this.loadForm();
          this.loadProductForm();
          this.loadCustomerForm();
          this.loadBasketForm({});
          this.getMyProducts();
  
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

    this.getCustomers();

  }

  getCustomers() {

    this.service.postService({ "url": "/master/customers" }).subscribe((res: any) => {

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

    this.service.postService({ "url": "/master/agentProducts" }).subscribe((res: any) => {

      if(res.status == "ok") {

        this.agentProdcuts = res.data;

        this.agentProdcuts = _.map(this.agentProdcuts, (e: any) => {
  
          e.productId.productImageURL = this.getFullImagePath(e?.productId?.productImageURL);
          
          return e;
  
        });
  
        this.agentProductsCount = res.totalCount;

      }

      this.getOtherProducts();

    });

  }

  getOtherProducts() {

    this.service.postService({ "url": "/master/otherProducts" }).subscribe((res: any) => {

      if(res.status == "ok") {

        this.otherProducts = res.data;

        this.otherProducts = _.map(this.otherProducts, (e: any) => {
  
          e.productImageURL = this.getFullImagePath(e?.productImageURL);
          
          return e;
  
        });

      }

    });

  }  
    
  getFullImagePath(imgUrl: any): string {
    // Replace backslashes with forward slashes
    const imagePath = imgUrl.replace(/\\/g, '/');
    return (this.service.imgBasePath + imagePath).toString();
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

      'customerId': [ null, Validators.required],

      'paymentStatus': ['Pending'],

      'orderStatus': ['Pending'],

      'orderType': ['normal'],

      'deliveryAvailable': [false],

      'pickupAvailable': [false],

      'pickupDate': [null],

      'pickupTimeSlot': [null],

      'expectedDeliveryDate': [null],

      'expectedDeliveryTimeSlot': [null],

      'itemList': this.service.fb.array([]),

      'qty': [0, Validators.required],

      'netAmt': [0, Validators.required],

      'discAmt': [0, Validators.required],

      'grossAmt': [0, Validators.required],

      'paymentMode': ['', Validators.required],      

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

      'productId': [ productDet?._id || this.selectedItemDet.productId?._id, Validators.required],

      'productName': [ productDet?.productName || this.selectedItemDet.productId?.productName, Validators.required],

      'productImageURL': [productDet?.productImageURL || this.selectedItemDet.productId?.productImageURL, Validators.required],

      'qty': [ productDet?.qty || null, Validators.required],

      'netAmt': [ productDet?.netAmt || 0, Validators.required],

      'priceList': this.service.fb.array([])

    });

    let priceList = productDet?.priceList || _.filter(this.selectedItemDet?.priceList,{ 'chargeType': this.f.orderType.value, 'is_active': true });

    _.map(priceList,(chargeDet:any, index: number)=>{

      chargeDet = { ...chargeDet, ..._.find(this.selectedItemDet.priceList, { 'chargeId': { '_id': _.isEmpty(productDet) ? chargeDet.chargeId?._id : chargeDet?.chargeId } }) };

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

  get if(): any { return this.f.itemList as FormArray; }

  get pf(): any { return this.productForm.controls; }

  get cf(): any { return this.pf.priceList as FormArray; }  

  get cusf(): any { return this.customerForm.controls; }

  get af(): any { return this.cusf.addressDetails.controls; }

  get bf(): any { return this.basketForm.controls; }

  openAsidebar({ canvasName = 'addCustomer', data = {} }:  { canvasName: 'addCustomer' | 'addProduct' | 'addBasket' | 'addDiscount', data?: any }) {

    this.canvasConfig['canvasName'] = canvasName;

    this.canvasConfig['applyBtnTxt'] = 'Save';

    this.canvasConfig['cancelBtnTxt'] = 'Clear';
    
    this.openCanvas = true;

    if(canvasName == 'addProduct') {

      this.canvasConfig['canvasTitle'] = 'Add Product';

      this.formSubmitted['productForm'] = false;
      
      this.loadProductForm();

    }

    if(canvasName == 'addCustomer') {

      this.canvasConfig['canvasTitle'] = 'Add Customer';

      this.formSubmitted['customerForm'] = false;
      
      this.loadCustomerForm();

    }

    if(canvasName == 'addBasket') {

      this.selectedItemDet = data;

      const productDet = _.find(this.f.itemList.value,{ 'productId': data.productId._id }) || {};

      this.canvasConfig['canvasTitle'] = `${_.isEmpty(productDet) ? 'Add New' : 'Update Existing' } Item`;

      this.canvasConfig['applyBtnTxt'] = `${_.isEmpty(productDet) ? 'Add to Basket' : 'Update in Basket' }`;

      this.canvasConfig['cancelBtnTxt'] = `${_.isEmpty(productDet) ? 'Clear' :  'Remove Item' }`;
      
      this.loadBasketForm({ productDet });

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

    }

    if(fieldName == 'is_active') {

      if(!this.cf.at(index).value.is_active) {

        this.cf.at(index).get('amount').setValue(null);

        this.cf.at(index).get('amount').setValidators([]);

        this.cf.at(index).get('amount').disable();

      } else {

        this.cf.at(index).get('amount').enable();

        this.cf.at(index).get('amount').setValidators([Validators.required]);

      }

      this.cf.at(index).get('amount').updateValueAndValidity();

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

    } else if(this.canvasConfig['canvasName'] == 'addProduct') {


    } else if(this.canvasConfig['canvasName'] == 'addBasket') {

      if(this.basketForm.value.qty <= 0) return this.service.showToastr({ "data": { "message": "Please select atleast one item", "type": "info" } });

      let itemIndex = _.findIndex(this.if.value, { 'productId': this.basketForm.value.productId });

      if(itemIndex > -1 ) {

        this.if.removeAt(itemIndex);
        
        this.if.insert(itemIndex,this.basketForm);

      }

      else this.if.push(this.basketForm);

      if(itemIndex >= 0) {

        this.orderForm.patchValue({

          'qty': _.sumBy(this.if.value,(e: any)=>parseFloat(e.qty)),

          'grossAmt': _.sumBy(this.if.value,(e: any)=>parseFloat(e.netAmt)).toCustomFixed(),

          'netAmt': (_.sumBy(this.if.value,(e: any)=>parseFloat(e.netAmt)) - parseFloat(this.orderForm.value.discAmt)).toCustomFixed()

        });

      } else {

        this.orderForm.patchValue({
  
          'qty': _.sumBy(this.if.value,(e: any)=>parseFloat(e.qty)),
  
          'grossAmt': _.sumBy(this.if.value,(e: any)=>parseFloat(e.netAmt)).toCustomFixed(),
  
          'netAmt': (_.sumBy(this.if.value,(e: any)=>parseFloat(e.netAmt)) - parseFloat(this.orderForm.value.discAmt)).toCustomFixed()
  
        });

      }

      this.service.showToastr({ "data": { "message": `Item ${ itemIndex > -1 ? 'added to basket' : 'Updated in basket' }`, "type": "success" } });

      this.canvas?.close();

    }

  }

  asidebarCancel() {

    if(this.canvasConfig['canvasName'] == 'addCustomer') {

      this.canvas?.close();

    } else if(this.canvasConfig['canvasName'] == 'addProduct') {

      this.canvas?.close();

    } else if(this.canvasConfig['canvasName'] == 'addBasket') {

      let itemIndex = _.findIndex(this.if.value, { 'productId': this.basketForm.value.productId });

      if(itemIndex >= 0) {

        this.if.removeAt(itemIndex);

        this.orderForm.patchValue({

          'qty': _.sumBy(this.if.value,(e: any)=>parseFloat(e.qty)),

          'grossAmt': _.sumBy(this.if.value,(e: any)=>parseFloat(e.netAmt)).toCustomFixed(),

          'netAmt': (_.sumBy(this.if.value,(e: any)=>parseFloat(e.netAmt)) - parseFloat(this.orderForm.value.discAmt)).toCustomFixed()

        });

        this.service.showToastr({ "data": { "message": "Item removed from basket", "type": "success" } });

        this.canvas?.close();

      } else this.canvas?.close();

    }

  }

}

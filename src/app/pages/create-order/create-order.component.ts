import { Component, ViewChild } from '@angular/core';
import { FormArray, Validators } from '@angular/forms';
import { OffcanvasComponent } from '@shared/components';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-create-order',
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.scss']
})
export class CreateOrderComponent {

  @ViewChild('customerCanvas') customerCanvas: OffcanvasComponent | undefined;
  @ViewChild('addProductCanvas') addProductCanvas: OffcanvasComponent | undefined;
  @ViewChild('productBasketCanvas') productBasketCanvas: OffcanvasComponent | undefined;
  @ViewChild('applyDiscountCanvas') applyDiscountCanvas: OffcanvasComponent | undefined;

  agentProdcuts!: Array<any>;
  otherProducts: Array<any> = [];
  productCharges: any[] = [];
  customerDetail!: any;
  agentProductsCount: number = 0;
  userSubscribe: any;
  _: any = _;
  productForm: any;
  orderForm: any;
  customerForm: any;
  basketForm: any;
  openCanvas: any = {
    customer: false,
    addProduct: false,
    productBasket: false,
    applyDiscount: false
  };
  masterList: any = {
    dialCodeList: [],
    countryList: [],
    stateList: [],
    cityList: [],
    areaList: []
  };
    
  constructor(public service: CommonService) {

    this.getCountries();

    this.userSubscribe = this.service.userDetailsObs.subscribe((value) => {

      if (!_.isEmpty(value)) {

        this.loadForm();
        this.loadProductForm();
        this.loadCustomerForm();
        this.loadBasketForm();
        this.getCharges();
        this.getMyProducts();

      }

    });

  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.loadForm();
    this.loadProductForm();
    this.loadCustomerForm();
    this.loadBasketForm();

  }

  getCategories() {
    
    this.service.getService({ "url": "/master/categories" }).subscribe((res: any) => {

      this.masterList['categoryList'] = res.status=='ok' ? res.data : [];

    });

  }

  getCharges() {

    this.service.getService({ "url": "/master/productCharges" }).subscribe((res: any) => {

      this.productCharges = res.status == "ok" ? res.data : [];

      this.productCharges = _.flatten(_.map(this.productCharges, (obj: any) => {

        obj.chargeType = 'normal';

        let obj2 = { ..._.cloneDeep(obj), chargeType: 'urgent' };
        
        return [obj, obj2];

      }));

      this.loadProductForm();

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

      this.getProducts();

    });

  }

  getProducts() {

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

  getDialCodes() {

    this.service.getService({ "url": "/address/dialCode" }).subscribe((res: any) => {

      this.masterList['dialCodeList'] = res.status=='ok' ? res.data : [];

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
  
  getFullImagePath(imgUrl: any): string {
    // Replace backslashes with forward slashes
    const imagePath = imgUrl.replace(/\\/g, '/');
    return (this.service.imgBasePath + imagePath).toString();
  }

  // Get Areas based on City

  getAreas() {

    this.service.getService({ "url": `/address/areas/${this.f.cityId.value}` }).subscribe((res: any) => {

      this.masterList['areaList'] = res.status=='ok' ? res.data : [];

    });

  }  

  loadForm() {

    this.orderForm = this.service.fb.group({

      'customerId': ['', Validators.required],

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

    _.map(this.productCharges,(chargeDet:any, index: number)=>{

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

  loadBasketForm() {

    this.basketForm = this.service.fb.group({

      'productId': [ null, Validators.required],

      'qty': [ null, Validators.required],

      'netAmt': [0, Validators.required],

      'priceList': this.service.fb.array([])

    });

    _.map(this.productCharges,(chargeDet:any, index: number)=>{

      this.bf.priceList.push(this.service.fb.group({

        'chargeId': [chargeDet._id, Validators.required],

        'chargeName': [chargeDet.chargeName, Validators.required],

        'imgURL': [this.getFullImagePath(chargeDet.imgURL), Validators.required],

        'amount': [ (chargeDet.amount || 0).toCustomFixed(), Validators.required],

        'qty': [ 0, Validators.required],

      }));

    });

  }  

  loadCustomerForm() {

    this.customerForm = this.service.fb.group({

      'firstName': [ null, Validators.required ],

      'lastName': [ null, Validators.required ],  

      'email': [ null, Validators.required ],

      'dialCode': [ null, [Validators.required]],

      'mobile': [ null, [Validators.required]],

      'customerType': 'pos',

      'addressDetails': this.service.fb.group({

        'addressLine1': [ null, Validators.required ],

        'addressLine2': [ null ],

        'areaId': [ null, Validators.required ],

        'cityId': [ null, Validators.required ],

        'stateId': [ null, Validators.required ],

        'countryId': [ null, Validators.required ],

        'pincode': [ null, Validators.required ],

      })
      
    });

    // Listen to Country changes and update State, City, Area and zipcode

    this.af['countryId'].valueChanges.subscribe((value: any) => {

      this.masterList = { ...this.masterList, 'stateList': [], 'cityList': [], 'areaList': [] };

      let countryDet = _.find(this.masterList['countryList'], { '_id': value });

      this.cf.addressDetailspatchValue({ 'cityId': null, 'stateId': null, 'areaId': null, 'zipcode': null }, { emitEvent: false });

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

      this.cf.addressDetailspatchValue({ 'cityId': null, 'areaId': null, 'zipcode': null }, { emitEvent: false });

    });

    // Listen to City changes and update Area and zipcode

    this.af['cityId'].valueChanges.subscribe((value: any) => {

      this.getAreas(); // Get Areas based on City

      this.cf.addressDetailspatchValue({ 'areaId': null, 'zipcode': null });

    });

    // Listen to Area changes

    this.af['areaId'].valueChanges.subscribe((value: any) => {

      this.cf.addressDetailspatchValue({ 
        
        'zipcode': _.get(_.find(this.masterList['areaList'], { '_id': value }), 'zipCode', null) 
      
      });

    });    

  }

  get f(): any { return this.orderForm.controls; }

  get pf(): any { return this.productForm.controls; }

  get cusf(): any { return this.customerForm.controls; }

  get af(): any { return this.cusf.addressDetails.controls; }

  get bf(): any { return this.basketForm.controls; }

  get cf(): any { return this.pf.priceList as FormArray; }



  openAsidebar({ canvasName = 'customer' }:  { canvasName: 'customer' | 'addProduct' | 'productBasket' | 'applyDiscount' }) {

    this.openCanvas[canvasName+'Canvas'] = true;

    if(canvasName == 'addProduct') this.loadProductForm();

    if(canvasName == 'customer') this.loadCustomerForm();

    if(canvasName == 'productBasket') this.loadBasketForm();

  }

  changeValue({ fieldName, index }: { fieldName: string, index: number }) {

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

}

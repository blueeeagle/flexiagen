import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { OffcanvasComponent } from '@shared/components';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-item-pricing',
  templateUrl: './item-pricing.component.html',
  styleUrls: ['./item-pricing.component.scss']
})
export class ItemPricingComponent {

  @ViewChild('canvas') canvas: OffcanvasComponent | undefined;
  agentProducts!: Array<any>;
  otherProducts!: Array<any>;
  agenProductsCount: number = 0;
  otherProductsCount: number = 0;
  productCharges: any[] = [];
  productCategories: any[] = [];
  userSubscribe: any;
  openCanvas: boolean = false;
  _: any = _;
  productForm: any;
  mode: 'Create' | 'Update' = 'Create';
  chargeTypes: Array<any> = [ { name: 'Normal', value: 'normal', selected: true }, { name: 'Urgent', value: 'urgent', selected: false } ];
  selectedChargeType: 'normal' | 'urgent' = 'normal';
  editData: any = {};
  selectedCategories: Array<any> = [];
  isAllProductsAdded: boolean = false;

  searchValue: string = '';

  constructor(public service: CommonService, private activateRoute: ActivatedRoute) { 

    this.service.setApiLoaders({ 'isLoading': true, 'url': ['/master/productCharges','/master/categories','/setup/agentProducts','/master/products'] });

    this.loadForm();

    if(!_.isEmpty(this.service.companyDetails)) this.getCharges();

    this.userSubscribe = this.service.userDetailsObs.subscribe((value)=>{

      if(!_.isEmpty(value)) {
        
        this.loadForm();

        this.getCharges();

      }

    });

  }

  getCharges() {

    forkJoin({

      "productCharges": this.service.getService({ "url": "/master/productCharges" }),

      "productCategories": this.service.postService({ "url": "/master/categories" }),

    }).subscribe({

      next: (res: any) => {

        if(res.productCategories.status == "ok") {

          this.productCategories = res.productCategories.data;

          this.selectedCategories = _.map(this.productCategories, '_id');

        }

        if(res.productCharges.status == "ok") {

          this.productCharges = res.productCharges.data;

          this.productCharges = _.flatten(_.map(this.productCharges, (obj: any) => {

            obj.chargeType = 'normal';
  
            let obj2 = { ..._.cloneDeep(obj), chargeType: 'urgent' };
            
            return [obj, obj2];
  
          }));

          this.loadForm();

          this.getProducts({ onInit: true });

        }

      },

      error: (error: any) => {

        this.service.showToastr({ data: { type: "error", message: error?.error?.message || `Item Pricing Listing failed` } });

      }

    });

  }

  getProducts({ onInit = false }: { onInit?: boolean }) {

    forkJoin({

      'agentProducts': this.service.postService({ "url": "/setup/agentProducts", "params": { "searchValue": this.searchValue }, "payload": { "categoryId": this.selectedCategories } }),

      'otherProducts': this.service.postService({ "url": "/master/products", "params": { "searchValue": this.searchValue }, "payload": { "categoryId": this.selectedCategories } })

    }).subscribe({

      next: (res: any) => {

        if(res.agentProducts.status == "ok") {

          this.agentProducts = res.agentProducts.data;

          this.agentProducts = _.map(this.agentProducts, (e: any) => {
    
            e.productId.productImageURL = this.service.getFullImagePath({ 'imgUrl': e?.productId?.productImageURL, 'baseUrlFrom': 'ADMIN_IMG_URL' });
            
            return e;
    
          });
    
          this.agenProductsCount = res.agentProducts.totalCount;

        }

        if(res.otherProducts.status == "ok") {

          this.otherProducts = res.otherProducts.data;

          this.isAllProductsAdded = onInit ? _.size(this.otherProducts) == 0 : this.isAllProductsAdded;

          this.otherProducts = _.map(this.otherProducts, (e: any) => {
    
            e.productImageURL = this.service.getFullImagePath({ 'imgUrl': e?.productImageURL, 'baseUrlFrom': 'ADMIN_IMG_URL' });
            
            return e;
    
          });

          this.otherProductsCount = res.otherProducts.totalCount;

        }

      },

      error: (error: any) => {

        this.service.showToastr({ data: { type: "error", message: error?.error?.message || `Item Pricing Listing failed` } });

      }

    });

  }   

  loadForm() { 

    this.productForm = this.service.fb.group({

      'productId': [ this.editData.productId?._id || null, Validators.required],

      'companyId': [ this.editData?.companyId || this.service.companyDetails._id, Validators.required],

      'priceList': this.service.fb.array([])

    });


    _.map(this.editData?.priceList || this.productCharges,(chargeDet:any, index: number)=>{

      this.cf.push(this.getChargeForm({ chargeDet }));

      this.changeValue({ fieldName: 'is_active', index });

    });

  }

  get f(): any { return this.productForm.controls; }

  get cf(): any { return this.f.priceList as FormArray; }

  getChargeForm({ chargeDet = {} }: { chargeDet: any })  {

    return this.service.fb.group({

      '_id': [chargeDet._id || null],

      'chargeId': [chargeDet.chargeId?._id || chargeDet._id, Validators.required],

      'chargeName': [chargeDet.chargeId?.chargeName || chargeDet.chargeName, Validators.required],

      'imgURL': [this.service.getFullImagePath({ 'imgUrl': chargeDet.chargeId?.imgURL || chargeDet.imgURL, 'baseUrlFrom': 'ADMIN_IMG_URL' }), Validators.required],

      'amount': [ (chargeDet.amount || 0).toCustomFixed(), Validators.required],

      'chargeType': [chargeDet?.chargeType || chargeDet.chargeType || 'normal', Validators.required],

      'is_active': [this.mode == 'Create' ? true : chargeDet?.is_active ],

    });

  }

  openAsidebar(data: any) {

    this.editData = data || {};

    this.selectedChargeType = 'normal';

    this.mode = _.isEmpty(data.companyId) ? 'Create' : 'Update';

    if(this.mode == 'Create') this.editData['productId'] = data;

    this.openCanvas = true;

    this.loadForm();

  }

  changeValue({ fieldName = "", index = -1 }: { fieldName: string, index: number }) {

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

  submit() {

    if(this.productForm.invalid) return;

    let payload = this.productForm.getRawValue();

    payload['priceList'] = _.map(payload.priceList, (e: any)=>{

      e['amount'] = parseFloat(e['amount'] || 0);

      return _.omit(e, ['chargeName', 'imgURL', ...e._id == null ? ['_id'] : [] ]);

    });

    forkJoin({

      "result": this.mode == 'Create' ? 
      
          this.service.postService({ url: "/setup/agentProduct", payload })
        
            : this.service.patchService({ url: `/setup/agentProduct/${this.editData?._id}`, payload })
      
    }).subscribe({
      
      next: (res: any) => {

        if (res.result.status == "ok") {

          this.canvas?.close();

          this.service.showToastr({ data: { type: "success", message:  `Product ${this.mode == 'Create' ? 'Added' : 'Updated'} Success` } });

          if(this.mode == 'Create') {

            let data: any = _.first(res.result.data);

            data['productId']['productImageURL'] = this.service.getFullImagePath({ 'imgUrl': data?.productId?.productImageURL, 'baseUrlFrom': 'ADMIN_IMG_URL' });

            this.agentProducts.push(data);

            this.otherProducts.splice(_.findIndex(this.otherProducts, { "_id": data.productId._id }), 1);

            this.agenProductsCount++;

            this.otherProductsCount--;

          } else {

            let data = res.result.data;

            data['productId']['productImageURL'] = this.service.getFullImagePath({ 'imgUrl': data?.productId?.productImageURL, 'baseUrlFrom': 'ADMIN_IMG_URL' });
            
            this.agentProducts.splice(_.findIndex(this.agentProducts, { _id: this.editData._id }), 1, res.result.data);

          }
  
        }

      },

      error: (error: any) => {

        this.service.showToastr({ data: { type: "error", message: error?.error?.message || `User ${this.mode == 'Create' ? 'Creation' : 'Updation'} failed` } });

      }

    });

  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.userSubscribe.unsubscribe();
  }

}
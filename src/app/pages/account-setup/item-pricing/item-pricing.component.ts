import { Component, ViewChild } from '@angular/core';
import { FormArray, Validators } from '@angular/forms';
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
  agentProdcuts!: Array<any>;
  otherProducts!: Array<any>;
  productCharges: any[] = [];
  userSubscribe: any;
  openCanvas: boolean = false;
  _: any = _;
  productForm: any;
  mode: 'Create' | 'Update' = 'Create';
  chargeTypes: Array<any> = [ { name: 'Normal', value: 'normal', selected: true }, { name: 'Urgent', value: 'urgent', selected: false } ];
  selectedChargeType: 'normal' | 'urgent' = 'normal';
  editData: any = {};

  constructor(public service: CommonService) { 

    this.service.setApiLoaders({ 'isLoading': true, 'url': ['/master/productCharges','/master/agentProducts','/master/otherProducts'] });

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

    this.service.getService({ "url": "/master/productCharges" }).subscribe((res: any) => {

      this.productCharges = res.status == "ok" ? res.data : [];

      this.productCharges = _.flatten(_.map(this.productCharges, (obj: any) => {

        obj.chargeType = 'normal';

        let obj2 = { ..._.cloneDeep(obj), chargeType: 'urgent' };
        
        return [obj, obj2];

      }));

      this.loadForm();

      this.getMyProducts();

    });

  }

  getMyProducts() {

    this.service.postService({ "url": "/master/agentProducts" }).subscribe((res: any) => {

      this.agentProdcuts = res.status == "ok" ? res.data : [];

      this.agentProdcuts = _.map(this.agentProdcuts, (e: any) => {

        e.productId.productImageURL = this.getFullImagePath(e?.productId?.productImageURL);
        
        return e;

      });

      this.getProducts();

    });

  }

  getFullImagePath(imgUrl: any): string {
    // Replace backslashes with forward slashes
    const imagePath = imgUrl.replace(/\\/g, '/');
    return (this.service.imgBasePath + imagePath).toString();
  }

  getProducts() {

    this.service.postService({ "url": "/master/otherProducts" }).subscribe((res: any) => {

      this.otherProducts = res.status == "ok" ? res.data : [];

      this.otherProducts = _.map(this.otherProducts, (e: any) => {

        e.productImageURL = this.getFullImagePath(e?.productImageURL);
        
        return e;

      });

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

      'imgURL': [this.getFullImagePath(chargeDet.chargeId?.imgURL || chargeDet.imgURL), Validators.required],

      'amount': [ (chargeDet.amount || 0).toCustomFixed(), Validators.required],

      'chargeType': [chargeDet?.chargeType || chargeDet.chargeType || 'normal', Validators.required],

      'is_active': [this.mode == 'Create' ? true : chargeDet?.is_active ],

    });

  }

  openAsidebar(data: any) {

    this.editData = data || {};

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

    } else if(fieldName == 'amount') {

    }

  }

  submit() {

    if(this.productForm.invalid) return;

    let payload = this.productForm.getRawValue();

    payload['priceList'] = _.map(payload.priceList, (e: any)=>{

      e['amount'] = parseFloat(e['amount'] || 0);

      return _.omit(e, ['chargeName', 'imgURL', ...e._id == null ? ['chargeId'] : [] ]);

    });

    forkJoin({

      "result": this.mode == 'Create' ? 
      
          this.service.postService({ url: "/master/agentProduct", payload })
        
            : this.service.patchService({ url: `/master/agentProduct/${this.editData?._id}`, payload })
      
    }).subscribe({
      
      next: (res: any) => {

        if (res.result.status == "ok") {

          this.canvas?.close();

          this.service.showToastr({ data: { type: "success", message:  `Product ${this.mode == 'Create' ? 'Added' : 'Updated'} Success` } });

          if(this.mode == 'Create') this.getMyProducts();

          else {

            let data = res.result.data;

            data['productId']['productImageURL'] = this.getFullImagePath(data?.productId?.productImageURL);
            
            this.agentProdcuts.splice(_.findIndex(this.agentProdcuts, { _id: this.editData._id }), 1, res.result.data);

          }
  
        }

      },

      error: (error: any) => {

        this.service.showToastr({ data: { type: "error", message: error?.error?.message || `User ${this.mode == 'Create' ? 'Creation' : 'Updation'} failed` } });

      }

    });

  }

}
import { Component } from '@angular/core';
import { FormArray, Validators } from '@angular/forms';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-item-pricing',
  templateUrl: './item-pricing.component.html',
  styleUrls: ['./item-pricing.component.scss']
})
export class ItemPricingComponent {

  agentProdcuts: any[] = [];
  otherProducts: any[] = [];
  productCharges: any[] = [];
  userSubscribe: any;
  openCanvas: boolean = false;
  _: any = _;
  productForm: any;
  mode: 'Create' | 'Update' = 'Create';
  editData: any = {};

  constructor(public service: CommonService) { 

    this.loadForm();

    if(!_.isEmpty(this.service.companyDetails)) {

      this.getCharges();

    }

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

      'productId': [this.editData.productId || null, Validators.required],

      'companyId': [this.service.companyDetails.companyId, Validators.required],

      'priceList': this.service.fb.array([])

    });

    _.map(this.editData?.priceList || this.productCharges,(chargeDet:any)=>{

      this.cf.push(this.getChargeForm({ chargeDet }));

    })

  }

  get f(): any { return this.productForm.controls; }

  get cf(): any { return this.f.priceList as FormArray; }

  getChargeForm({ chargeDet = {} }: { chargeDet: any })  {

    return this.service.fb.group({

      'chargeId': [chargeDet.chargeId?._id || chargeDet._id, Validators.required],

      'chargeName': [chargeDet.chargeId?.chargeName || chargeDet.chargeName, Validators.required],

      'is_active': [this.mode == 'Create' ? true : chargeDet.is_active, Validators.required],

    });

  }

  openAsidebar(data: any) {

    this.editData = data || {};

    this.mode = _.isEmpty(data.companyId) ? 'Create' : 'Update';

    this.openCanvas = true;

  }

  submit() {

  }

}
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
  asidebarType: "ItemPricing" | "ItemDetails" = "ItemPricing";
  agentProducts!: Array<any>;
  otherProducts!: Array<any>;
  agenProductsCount: number = 0;
  otherProductsCount: number = 0;
  productCharges: any[] = [];
  productCategories: any[] = [];
  userSubscribe: any;
  openCanvas: boolean = false;
  productImageURL: any = '';
  _: any = _;
  productForm: any;
  itemForm: any;
  mode: 'Create' | 'Update' = 'Create';
  chargeTypes: Array<any> = [ { name: 'Normal', value: 'normal', selected: true }, { name: 'Urgent', value: 'urgent', selected: false } ];
  selectedChargeType: 'normal' | 'urgent' = 'normal';
  editData: any = {};
  selectedCategories: Array<any> = [];
  serviceList: Array<any> = [];
  isAllProductsAdded: boolean = false;
  isLoading: boolean = false;

  searchValue: string = '';

  constructor(public service: CommonService, private activateRoute: ActivatedRoute) { 

    this.service.setApiLoaders({ 'isLoading': true, 'url': ['/master/productCharges','/master/categories','/setup/agentProducts','/master/products'] });

    this.loadForm();

    this.loadItemForm();

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

      'serviceList': this.service.getService({ "url": "/setup/services" }), 

      "productCharges": this.service.getService({ "url": "/master/productCharges" }),

      "productCategories": this.service.postService({ "url": "/master/categories" }),

    }).subscribe({

      next: (res: any) => {

        if(res.serviceList.status == "ok") {

          this.serviceList = res.serviceList.data || [];

        }

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

  loadItemForm() {

    let serviceDet = _.find(this.serviceList, { 'serviceName': "Laundry" });

    this.itemForm = this.service.fb.group({

      'companyId': [ this.service.companyDetails?._id, Validators.required ],

      'serviceId': [ this.editData.serviceId?._id || serviceDet?._id, Validators.required ],

      'categoryId': [ this.editData.categoryId?._id || null, Validators.required ],

      'productName': [ this.editData.productName || null, Validators.required ],

      'shortDesc': [ this.editData.shortDesc || null ],

      'productImageURL': [ this.mode == 'Update' ? this.service.getFullImagePath({ 'imgUrl': this.editData.productImageURL, 'baseUrlFrom': 'ADMIN_IMG_URL' }) : null ],

    });

    this.productImageURL = null;

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

  get itf(): any { return this.itemForm.controls; }

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

  openAsidebar({ data = {}, type = "ItemPricing" }: { data?: any, type?: "ItemPricing" | "ItemDetails" }) {

    this.editData = data || {};

    this.asidebarType = type;

    this.selectedChargeType = 'normal';

    this.mode = _.isUndefined(this.editData.companyId) ? 'Create' : 'Update';

    if(this.asidebarType == "ItemPricing") {

      if(this.mode == 'Create') this.editData['productId'] = data;
  
      this.loadForm();

    } else {

      this.loadItemForm();

    }

    this.openCanvas = true;

  }

  changeValue({ fieldName = "", index = -1 }: { fieldName: string, index: number }) {

    if(fieldName == 'is_active') {

      let anotherIndex = _.findIndex(this.cf.value, { 'chargeId': this.cf.at(index).value.chargeId, 'chargeType': this.cf.at(index).value.chargeType == 'normal' ? 'urgent' : 'normal' });

      if(!this.cf.at(index).value.is_active) {

        this.cf.at(index).get('amount').setValue(null);

        this.cf.at(anotherIndex).get('amount').setValue(null);

        this.cf.at(index).get('amount').setValidators([]);

        this.cf.at(anotherIndex).get('amount').setValidators([]);

        this.cf.at(index).get('amount').disable();

        this.cf.at(anotherIndex).get('amount').disable();

      } else {

        this.cf.at(index).get('amount').enable();

        this.cf.at(anotherIndex).get('amount').enable();

        this.cf.at(index).get('amount').setValidators([Validators.required]);

        this.cf.at(anotherIndex).get('amount').setValidators([Validators.required]);

        let existingValue = _.find(this.editData.priceList,{ 'chargeId': { '_id': this.cf.at(index).value.chargeId }, 'chargeType': this.cf.at(index).value.chargeType }) || {};

        let anotherValue = _.find(this.editData.priceList,{ 'chargeId': { '_id': this.cf.at(anotherIndex).value.chargeId }, 'chargeType': this.cf.at(anotherIndex).value.chargeType }) || {};

        this.cf.at(index).get('amount').setValue((existingValue.amount || 0).toCustomFixed());

        this.cf.at(anotherIndex).get('amount').setValue((anotherValue.amount || 0).toCustomFixed());

      }

      this.cf.at(index).get('amount').updateValueAndValidity();

      this.cf.at(anotherIndex).get('amount').updateValueAndValidity();

    } 

  }

  submit() {

    if(this.asidebarType == "ItemPricing") {

      if(this.productForm.invalid) return;
  
      this.isLoading = true;
  
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
  
          this.isLoading = false;
  
        }, error: (error: any) => {
  
          this.isLoading = false;
  
          this.service.showToastr({ data: { type: "error", message: error?.error?.message || `User ${this.mode == 'Create' ? 'Creation' : 'Updation'} failed` } });
  
        }
  
      });

    } else this.submitItemDetails(); 


  }

  uploadFile(event:any) {

    const file = event.target?.files[0]; // Here we use only the first file (single file)

    if(file) {

      const reader = new FileReader();

      // validate file type & size

      const validFileExtensions = ['image/jpeg','image/jpg','image/png'];

      if(!validFileExtensions.includes(file.type)) return this.service.showToastr({ data: { type: "error", message: "Invalid file type" } });

      if(file.size > 1048576) return this.service.showToastr({ data: { type: "error", message: "File size should not exceed 1MB" } });

      // check dimensions of image

      // const img = new Image();

      // img.src = window.URL.createObjectURL(file);

      // img.onload = () => {

      //   if(img.width != 150 || img.height != 150) return this.service.showToastr({ data: { type: "error", message: "Image should be 150px X 150px" } });

      //   else {

          // File Preview
      
          reader.onload = () => {

            this.itemForm.patchValue({ "productImageURL": reader.result as string });

            this.productImageURL = file;

          }

          reader.readAsDataURL(file);

      //   }

      // }

    }

  }

  submitItemDetails() {

    if(this.itemForm.invalid) return;

    if(this.itemForm.value.productImageURL == null) return this.service.showToastr({ data: { type: "error", message: "Please upload product image" } });

    this.isLoading = true;

    let payload = this.itemForm.getRawValue();

    const formData = new FormData();

    formData.append("data", JSON.stringify(payload));

    if(this.productImageURL) formData.append("productImageURL", this.productImageURL);

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

        this.isLoading = false;

      }, error: (error: any) => {

        this.isLoading = false;

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
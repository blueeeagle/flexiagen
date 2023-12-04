import { Component } from '@angular/core';
import { CommonService } from '@shared/services/common/common.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-item-pricing',
  templateUrl: './item-pricing.component.html',
  styleUrls: ['./item-pricing.component.scss']
})
export class ItemPricingComponent {

  agentProdcuts: any[] = [];
  otherNewProducts: any[] = [];
  userSubscribe: any;

  constructor(private service: CommonService) { 

    this.loadForm();

    if(!_.isEmpty(this.service.companyDetails)) this.getProducts();

    this.userSubscribe = this.service.userDetailsObs.subscribe((value)=>{

      if(!_.isEmpty(value)) {
        
        this.loadForm();

        this.getProducts();

      }

    });

  }

  getProducts() {


  }

  loadForm() {

  }


}
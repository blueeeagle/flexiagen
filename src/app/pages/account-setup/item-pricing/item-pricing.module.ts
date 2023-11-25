import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ItemPricingRoutingModule } from './item-pricing-routing.module';
import { ItemPricingComponent } from './item-pricing.component';
import { SharedModule } from '@shared/shared.module';


@NgModule({
  declarations: [
    ItemPricingComponent
  ],
  imports: [
    CommonModule,
    ItemPricingRoutingModule,
    SharedModule
  ]
})
export class ItemPricingModule { }

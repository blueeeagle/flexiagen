import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MySubscriptionRoutingModule } from './my-subscription-routing.module';
import { MySubscriptionComponent } from './my-subscription.component';
import { SharedModule } from '@shared/shared.module';


@NgModule({
  declarations: [
    MySubscriptionComponent
  ],
  imports: [
    CommonModule,
    MySubscriptionRoutingModule,
    SharedModule
  ]
})
export class MySubscriptionModule { }

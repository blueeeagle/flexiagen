import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MySubscriptionRoutingModule } from './my-subscription-routing.module';
import { MySubscriptionComponent } from './my-subscription.component';


@NgModule({
  declarations: [
    MySubscriptionComponent
  ],
  imports: [
    CommonModule,
    MySubscriptionRoutingModule
  ]
})
export class MySubscriptionModule { }

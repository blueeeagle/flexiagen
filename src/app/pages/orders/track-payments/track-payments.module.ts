import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TrackPaymentsRoutingModule } from './track-payments-routing.module';
import { TrackPaymentsComponent } from './track-payments.component';
import { SharedModule } from '@shared/shared.module';


@NgModule({
  declarations: [
    TrackPaymentsComponent
  ],
  imports: [
    CommonModule,
    TrackPaymentsRoutingModule,
    SharedModule
  ]
})
export class TrackPaymentsModule { }

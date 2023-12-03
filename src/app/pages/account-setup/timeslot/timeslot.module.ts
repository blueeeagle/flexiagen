import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimeslotRoutingModule } from './timeslot-routing.module';
import { TimeslotComponent } from './timeslot.component';
import { SharedModule } from '@shared/shared.module';


@NgModule({
  declarations: [
    TimeslotComponent
  ],
  imports: [
    CommonModule,
    TimeslotRoutingModule,
    SharedModule
  ]
})
export class TimeslotModule { }
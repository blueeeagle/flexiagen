import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TrackStatusRoutingModule } from './track-status-routing.module';
import { TrackStatusComponent } from './track-status.component';
import { SharedModule } from '@shared/shared.module';


@NgModule({
  declarations: [
    TrackStatusComponent
  ],
  imports: [
    CommonModule,
    TrackStatusRoutingModule,
    SharedModule
  ]
})
export class TrackStatusModule { }

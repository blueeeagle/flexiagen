import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApprovalPendingRoutingModule } from './approval-pending-routing.module';
import { ApprovalPendingComponent } from './approval-pending.component';


@NgModule({
  declarations: [
    ApprovalPendingComponent
  ],
  imports: [
    CommonModule,
    ApprovalPendingRoutingModule
  ]
})
export class ApprovalPendingModule { }

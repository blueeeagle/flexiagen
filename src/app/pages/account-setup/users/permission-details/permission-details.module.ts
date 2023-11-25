import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PermissionDetailsRoutingModule } from './permission-details-routing.module';
import { PermissionDetailsComponent } from './permission-details.component';
import { SharedModule } from '@shared/shared.module';


@NgModule({
  declarations: [
    PermissionDetailsComponent
  ],
  imports: [
    CommonModule,
    PermissionDetailsRoutingModule,
    SharedModule
  ]
})
export class PermissionDetailsModule { }

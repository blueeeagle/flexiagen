import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RolesAndPermissionsRoutingModule } from './roles-and-permissions-routing.module';
import { RolesAndPermissionsComponent } from './roles-and-permissions.component';
import { SharedModule } from '@shared/shared.module';


@NgModule({
  declarations: [
    RolesAndPermissionsComponent
  ],
  imports: [
    CommonModule,
    RolesAndPermissionsRoutingModule,
    SharedModule
  ]
})
export class RolesAndPermissionsModule { }

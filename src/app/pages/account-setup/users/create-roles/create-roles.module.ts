import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CreateRolesRoutingModule } from './create-roles-routing.module';
import { CreateRolesComponent } from './create-roles.component';
import { SharedModule } from '@shared/shared.module';


@NgModule({
  declarations: [
    CreateRolesComponent
  ],
  imports: [
    CommonModule,
    CreateRolesRoutingModule,
    SharedModule
  ]
})
export class CreateRolesModule { }

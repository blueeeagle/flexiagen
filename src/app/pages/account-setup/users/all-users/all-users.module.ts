import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AllUsersRoutingModule } from './all-users-routing.module';
import { AllUsersComponent } from './all-users.component';
import { SharedModule } from '@shared/shared.module';


@NgModule({
  declarations: [
    AllUsersComponent
  ],
  imports: [
    CommonModule,
    AllUsersRoutingModule,
    SharedModule
  ]
})
export class AllUsersModule { }

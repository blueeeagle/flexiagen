import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionDetailsComponent } from './permission-details.component';

const routes: Routes = [
  {
    path:"",
    component:PermissionDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PermissionDetailsRoutingModule { }

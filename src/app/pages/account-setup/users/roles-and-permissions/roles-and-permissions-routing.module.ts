import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RolesAndPermissionsComponent } from './roles-and-permissions.component';

const routes: Routes = [
  {
    path: "",
    component: RolesAndPermissionsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RolesAndPermissionsRoutingModule { }

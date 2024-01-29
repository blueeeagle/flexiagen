import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateRolesComponent } from './create-roles.component';

const routes: Routes = [
  {
    path: "",
    component: CreateRolesComponent
  },
  {
    path: ":id",
    component: CreateRolesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateRolesRoutingModule { }

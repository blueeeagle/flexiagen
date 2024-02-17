import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: "list",
    loadChildren: () => import('./customer-list/customer-list.module').then(m => m.CustomerListModule)
  },
  {
    path: "details/:customerId",
    loadChildren: () => import('./customer-details/customer-details.module').then(m => m.CustomerDetailsModule)
  },
  {
    path: "",
    redirectTo: "list", 
    pathMatch: "full"
  },
  {
    path: "**",
    redirectTo: "list",
    pathMatch: "full"
  }, 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomersRoutingModule { }

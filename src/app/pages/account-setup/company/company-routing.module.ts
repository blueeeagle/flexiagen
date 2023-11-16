import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: "company-details",
    loadChildren: () => import('./company-details/company-details.module').then(m => m.CompanyDetailsModule)
  },
  {
    path:"service-details",
    loadChildren : () => import('./service-details/service-details.module').then(m=>m.ServiceDetailsModule)
  },
  {
    path:"address-details",
    loadChildren : () => import('./address-details/address-details.module').then(m=>m.AddressDetailsModule)
  },
  {
    path:"account-details",
    loadChildren : () => import('./account-details/account-details.module').then(m=>m.AccountDetailsModule)
  },
  {
    path: "",
    redirectTo: "company-details", 
    pathMatch: "full"
  },
  {
    path: "**",
    redirectTo: "company-details",
    pathMatch: "full"
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompanyRoutingModule { }

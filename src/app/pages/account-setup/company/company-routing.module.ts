import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: "company-details",
    loadChildren: () => import('./company-details/company-details.module').then(m => m.CompanyDetailsModule)
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

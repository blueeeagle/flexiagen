import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { companyDetailGuard } from '@core/guard/company-detail/company-detail.guard';
import { LoginGuard } from '@core/guard/login/login.guard';

const routes: Routes = [
  {
    path: "register",
    loadChildren: () => import("./register/register.module").then(m => m.RegisterModule),
    canActivate: [LoginGuard]
  },
  {
    path: "company-details/:paymentId",
    loadChildren: () => import("./company-details/company-details.module").then(m => m.CompanyDetailsModule),
    canActivate: [companyDetailGuard]
  },
  {
    path: "login",
    loadChildren: () => import("./login/login.module").then(m => m.LoginModule),
    canActivate: [LoginGuard]
  },
  {
    path: "forgot-password",
    loadChildren: () => import("./forgot-password/forgot-password.module").then(m => m.ForgotPasswordModule)
  },
  {
    path: "approval-pending",
    loadChildren: () => import("./approval-pending/approval-pending.module").then(m => m.ApprovalPendingModule)
  },
  {
    path: "",
    redirectTo: "login",
    pathMatch: "full"
  },
  {
    path: "**",
    redirectTo: "login",
    pathMatch: "full"
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }

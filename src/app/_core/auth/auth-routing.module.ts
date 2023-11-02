import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: "register",
    loadChildren: () => import("./register/register.module").then(m => m.RegisterModule)
  },
  {
    path: "login",
    loadChildren: () => import("./login/login.module").then(m => m.LoginModule)
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

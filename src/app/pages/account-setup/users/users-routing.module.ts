import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: "users",
    loadChildren: () => import('./users-list/users-list.module').then(m=>m.UsersListModule)
  },
  {
    path: "roles-and-permissions",
    loadChildren: () => import('./roles-and-permissions/roles-and-permissions.module').then(m=>m.RolesAndPermissionsModule)
  },
  {
    path: "roles",
    loadChildren: () => import('./create-roles/create-roles.module').then(m=>m.CreateRolesModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
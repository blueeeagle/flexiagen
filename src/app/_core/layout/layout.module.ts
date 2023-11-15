import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopNavbarComponent } from './top-navbar/top-navbar.component';



@NgModule({
  declarations: [
    SidebarComponent,
    TopNavbarComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    SidebarComponent,
    TopNavbarComponent
  ]
})
export class LayoutModule { }

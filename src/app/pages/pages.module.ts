import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagesRoutingModule } from './pages-routing.module';
import { PagesComponent } from './pages.component';
import { LayoutModule } from '@core/layout/layout.module';
import { NgxSpinnerModule } from 'ngx-spinner';


@NgModule({
  declarations: [
    PagesComponent
  ],
  imports: [
    CommonModule,
    PagesRoutingModule,

    NgxSpinnerModule,

    LayoutModule
  ]
})
export class PagesModule { }

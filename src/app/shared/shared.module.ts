import { NgModule } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material/material.module';

import { NgSelectModule } from '@ng-select/ng-select';

import { 
  DecimalNumberDirective,
  NumberDirective,
  HoverClassDirective,
  TextareaAutoresizeDirective,
} from './directives';

import { 
  EnumeratePipe,
  DynamicPipe
} from './pipes';

import {
  CommonToastrComponent,
  ConfirmationDialogComponent,
  ModalComponent,
  PageTitleComponent,
  PaginationComponent
} from './components';

import { ConfirmationDialogService } from './components/confirmation-dialog/confirmation.service';

import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { RouterModule } from '@angular/router';

export const MY_FORMATS = {
    parse: {
      dateInput: "DD-MM-YYYY"
    },
    display: {
      dateInput: "DD-MM-YYYY",
      monthYearLabel: "MMM YYYY",
      dateA11yLabel: "DD-MM-YYYY",
      monthYearA11yLabel: "MMMM YYYY"
    }
};


@NgModule({
  declarations: [
    // Directives
    DecimalNumberDirective,
    NumberDirective,
    HoverClassDirective,
    TextareaAutoresizeDirective,
    // Pipes
    EnumeratePipe,
    DynamicPipe,
    // Components
    CommonToastrComponent,
    ConfirmationDialogComponent,
    ModalComponent,
    PageTitleComponent,
    PaginationComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    NgSelectModule
  ],
  exports : [
    // Modules
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule, 
    NgSelectModule,
    // Directives
    DecimalNumberDirective,
    NumberDirective,
    HoverClassDirective,
    TextareaAutoresizeDirective,
    // Pipes
    EnumeratePipe,
    DynamicPipe,
    // Components
    CommonToastrComponent,
    ConfirmationDialogComponent,
    ModalComponent,
    PageTitleComponent,
    PaginationComponent
  ],
  providers: [
    ConfirmationDialogService,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [ MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS ] },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: MY_FORMATS },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    DecimalPipe,
    DatePipe
  ]
})
export class SharedModule { }

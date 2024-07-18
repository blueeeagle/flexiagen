import { NgModule } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material/material.module';

import { NgSelectModule } from '@ng-select/ng-select';

import { NgOtpInputModule } from  'ng-otp-input';

import { 
  DecimalNumberDirective,
  NumberDirective,
  HoverClassDirective,
  TextareaAutoresizeDirective,
  NoNumericOnlyDirective,
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
  PaginationComponent,
  OffcanvasComponent,
  SuccessModalComponent,
  NgSelectComponent
} from './components';

import { ConfirmationDialogService } from './components/confirmation-dialog/confirmation.service';

import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { RouterModule } from '@angular/router';
import { CardNumberFormatterDirective } from './directives/cardFormatter.directive';
import { ExpirationDateFormatterDirective } from './directives/cardExpiry.directive';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD-MM-YYYY'
  },
  display: {
    dateInput: 'DD-MM-YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@NgModule({
  declarations: [
    // Directives
    DecimalNumberDirective,
    NumberDirective,
    HoverClassDirective,
    TextareaAutoresizeDirective,
    NoNumericOnlyDirective,
    CardNumberFormatterDirective,
    ExpirationDateFormatterDirective,
    // Pipes
    EnumeratePipe,
    DynamicPipe,
    // Components
    CommonToastrComponent,
    ConfirmationDialogComponent,
    ModalComponent,
    PageTitleComponent,
    PaginationComponent,
    OffcanvasComponent,
    SuccessModalComponent,
    NgSelectComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    NgSelectModule,
    NgOtpInputModule
  ],
  exports : [
    // Modules
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule, 
    NgSelectModule,
    NgOtpInputModule,
    // Directives
    DecimalNumberDirective,
    NumberDirective,
    HoverClassDirective,
    TextareaAutoresizeDirective,
    NoNumericOnlyDirective,
    CardNumberFormatterDirective,
    ExpirationDateFormatterDirective,
    // Pipes
    EnumeratePipe,
    DynamicPipe,
    // Components
    CommonToastrComponent,
    ConfirmationDialogComponent,
    ModalComponent,
    PageTitleComponent,
    PaginationComponent,
    OffcanvasComponent,
    SuccessModalComponent,
    NgSelectComponent
  ],
  providers: [
    ConfirmationDialogService,
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    { provide: DateAdapter, useClass: MomentDateAdapter },
    DecimalPipe,
    DatePipe
  ]
})
export class SharedModule { }

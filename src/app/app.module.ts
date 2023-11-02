import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Enable animations module
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbActiveModal, NgbModule,  } from '@ng-bootstrap/ng-bootstrap';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { MainInterceptor } from './_core/interceptor/main.interceptor';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    HttpClientModule,
    BrowserAnimationsModule,
    SharedModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: MainInterceptor, multi: true },
    NgbActiveModal
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
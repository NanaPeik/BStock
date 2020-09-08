import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ImportComponent } from './import/import.component';
import { ExportComponent } from './export/export.component';
import { extraRowForSelectpicker } from 'src/extraRowForSelectpicker';

import { FormsModule } from '@angular/forms'
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'
import { interceptor } from 'src/interceptor';
import { GlobalVariables } from 'src/globalVariables';
import { ReusableServicesService } from './reusable-services.service';
import { ImportService } from './import/import.service';
import { DatePipe } from '@angular/common';

import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ReturnComponent } from './return/return.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule, MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatFormFieldControl, MatInputModule } from '@angular/material';
@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    ImportComponent,
    ExportComponent,
    ReturnComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BsDatepickerModule.forRoot(),
    HttpClientModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  providers: [
    extraRowForSelectpicker,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: interceptor,
      multi: true
    },
    GlobalVariables,
    ReusableServicesService,
    ImportService,
    DatePipe,
    ImportComponent,
    AppComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

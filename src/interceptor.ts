import { HttpInterceptor } from '@angular/common/http';
import { Injectable } from '@angular/core';


import {
    HttpRequest,
    HttpResponse,
    HttpErrorResponse,
    HttpHandler,
    HttpEvent
  } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from "rxjs";
import { AppComponent } from './app/app.component';

declare var $:any;

@Injectable()
export class interceptor implements HttpInterceptor{
    constructor(private appComponent: AppComponent){}
    intercept(req: import("@angular/common/http").HttpRequest<any>, next: import("@angular/common/http").HttpHandler) {
        document.getElementById('spinner_parent').style.display = "block"
        
        return next.handle(req).pipe(
            tap((ev: HttpEvent<any>) => {
                if (ev instanceof HttpResponse) {
                    //console.log('fromTap')
                    if(ev.body.OperationStatus == -1){
                        this.validate(ev.body.Error)
                    }
                    else if(ev.body.OperationStatus == -4){
                        alert('თქვენს სესიას ვადა გაუვიდა, გთხოვთ ხელახლა გაიაროთ ავტორიზაცია.')
                        this.appComponent.logOut()
                    }

                    if(ev.url.includes('Authorization/LogOut?authorizationID') && (ev.body.OperationStatus == 1 || ev.body.OperationStatus == -4)){
                        return
                    }

                    document.getElementById('spinner_parent').style.display = "none"
                }
                else{
                    return
                    console.log(2)
                }
            }),
            catchError(response => {
                //სემთხვევა როდესაც სერვისი შედის error_ში
                if (response instanceof HttpErrorResponse) {
                    //console.log('fromCatchError')
                    alert('გაუთვალისწინებელი შეცდომა...')
                    document.getElementById('spinner_parent').style.display = "none"
                }
                return throwError(response);
            })
        )
    }


    validate(errorText) {
        let status: boolean = false
        let exceptions = [
            { errorText: 'Incorrect authorization guid', relevantText: 'არასწორი ავტორიზაციის guid'},
            { errorText: 'Client Not Found', relevantText: 'კლიენტი არ მოიძებნა'},
            { errorText: 'BillNumber already exists', relevantText: 'ზედნადები ასეთი ნომრით უკვე მიღებულია'}
        ]
        
        let alertText = 'ზოგადი შეცდომა'
        let serviceError = errorText
        if (serviceError != undefined) {
            for (let i = 0; i < exceptions.length; i++) {
                if(exceptions[i].errorText == serviceError){
                    alertText = exceptions[i].relevantText
                    break
                }
            }
        }
        alert(alertText)

        return status
    }
}
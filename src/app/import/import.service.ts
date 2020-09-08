import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalVariables } from 'src/globalVariables';
import { extraRowForSelectpicker } from 'src/extraRowForSelectpicker';

declare var $: any
@Injectable({
  providedIn: 'root'
})
export class ImportService {

  constructor(private http: HttpClient, private globalVariables: GlobalVariables, private newRow: extraRowForSelectpicker) { }

  //მომწოდებლების სია
  suppliersList = []
  saveActiveSupplier
  loadSuppliers() {
    this.saveActiveSupplier = $('#supplier').val()
    this.http.get(this.globalVariables.url + '/Company/GetProductSupplierList?authorizationId=' + this.globalVariables.authorizationID)
      .subscribe((data: any) => {
        if (data.OperationStatus == 1) {
          this.suppliersList = data.Result
        }
      },
        error => {
          console.log('error')
        },
        () => {
          setTimeout(() => {
            $('#supplier').selectpicker('val', this.saveActiveSupplier)
            $('#supplier').selectpicker('refresh');
            this.newRow.newRowForDropdown("supplier")
          });
        })
  }

  //
  currencyList = []
  activeCurrency_name = ""
  activeCurrency_code = ""
  loadCurrencyList() {
    this.http.get(this.globalVariables.url + '/Product/GetCurrencies?authorizationID=' + this.globalVariables.authorizationID + '&status=')
      .subscribe((data: any) => {
        if (data.OperationStatus == 1) {
          this.currencyList = data.Result
          this.activeCurrency_name = data.Result[0].Name
          this.activeCurrency_code = data.Result[0].Code
        }
      },
        error => {
          console.log('error')
        },
        () => {

        })
  }
}

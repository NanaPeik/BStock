import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalVariables } from 'src/globalVariables';
import { Observable } from 'rxjs';

declare var $: any;
@Injectable({
  providedIn: 'root'
})
export class ExportService {
  constructor(private http: HttpClient, private globalVariables: GlobalVariables) {
  }

  //ინფორმაცია კლიენტის შესახებ
  clientInformation: any = []
  getCustomer(value, exportcomponent?) {
    this.http.get(this.globalVariables.url + '/Client/GetClient?codeOrName=' + value + '&authorizationID=' + this.globalVariables.authorizationID)
      .subscribe((data: any) => {
        this.clientInformation = []
        if (data.OperationStatus == 1) {
          this.clientInformation = data.Result[0]
          $('#client').val(value)
          if (exportcomponent != undefined && Object.keys(exportcomponent.exportautocompleteImExportcomponent).length != 0) {
            exportcomponent.changeTab('next')
          }
        }
      },
        error => {
          console.log('error')
          this.clientInformation = []
        })
    //   () => {
    //     setTimeout(() => {
    //       $('#supplier').selectpicker('val', this.saveActiveSupplier)
    //       $('#supplier').selectpicker('refresh');
    //       this.newRow.newRowForDropdown("supplier")
    //     });
    //   })
  }

  //იურიდიული პირების ჩატვირთვა
  legal_list = []
  loadLegals() {
    this.http.get(this.globalVariables.url + '/Client/GetLegals?authorizationID=' + this.globalVariables.authorizationID)
      .subscribe((data: any) => {
        if (data.OperationStatus == 1) {
          this.legal_list = data.Result
        }
      },
        error => {
          console.log('error')
        },
        () => {
          setTimeout(() => {
            $('#iurId').selectpicker('refresh')
          });
        })
  }

  //userCode1_ის მიხედვით ჩაშლების მოძებნა...
  productBarCode = ''
  actualProductUnitPrice_fromExportService = ''
  getProductBarCode(stockCode, userCode, brandCode) {
    this.productBarCode = ''

    this.http.get(this.globalVariables.url + '/Product/GetProductBarCode?authorizationId=' + this.globalVariables.authorizationID + '&stockCode=' + stockCode + '&productUserCode=' + userCode + '&brandCode=' + brandCode)
      .subscribe((data: any) => {
        if (data.OperationStatus == 1) {
          this.productBarCode = data.Result[0].PartNumber
          if (this.productBarCode == undefined) {
            this.productBarCode = ''
            alert('ლოკალური შეცდომა... barCode არ მოიძებნა')
            return
          }

          this.getProductPrice(stockCode)
        }
      })
  }

  //
  dimensionsForExport = []
  getProductPrice(stockCode, dimmensionCode?) {
    if (dimmensionCode == undefined) {
      this.dimensionsForExport = []
    }
    this.http.get(this.globalVariables.url + '/Product/GetProductPrice?StockCode=' + stockCode + '&productCode=' + this.productBarCode + '&authorizationId=' + this.globalVariables.authorizationID)
      .subscribe((data: any) => {
        if (data.OperationStatus == 1) {
          if (dimmensionCode != undefined) {
            if (data.Result.filter(o => o.DimmensionCode == dimmensionCode)[0] == undefined) {
              alert('შეცდომა: ერთეულის ფასი ვერ მოიძებნა.')
              return
            }
          }
          if (dimmensionCode == undefined) {
            for (let index = 0; index < data.Result.length; index++) {
              this.dimensionsForExport.push({
                Name: data.Result[0].DimmensionName,
                Code: data.Result[0].DimmensionCode,
                Quantity: data.Result[0].RealizationUnitPrice
              })
            }
          }
        }
      },
        error => {
          console.log('error')
        },
        () => {
          setTimeout(() => {
            if (this.dimensionsForExport.length = 1) {
              $('#dimension_select').selectpicker('val', this.dimensionsForExport[0].Code)
              this.actualProductUnitPrice_fromExportService = this.dimensionsForExport[0].Quantity
            }
            $('#dimension_select').selectpicker('refresh')
          });
        })
  }
}

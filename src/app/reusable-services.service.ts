import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalVariables } from 'src/globalVariables';
import { extraRowForSelectpicker } from 'src/extraRowForSelectpicker';
import { AppComponent } from './app.component';
import { DatePipe } from '@angular/common';
import { ImportComponent } from './import/import.component';
import { ExportService } from './export/export.service';
import { ExportComponent } from './export/export.component';

declare var $: any;

@Injectable()
export class ReusableServicesService {


  constructor(public http: HttpClient, public globalVariables: GlobalVariables, public newRow: extraRowForSelectpicker, public datePipe: DatePipe, public exportservice: ExportService) {
  }

  //მთავარი ცხრილის ჩატვირთვა
  forScrollTop = ''
  datasForSupplieTable = []
  loadSuppliesTable(requiredDatas) {
    this.http.get(this.globalVariables.url + '/Report/GetRSum?authorizationID=' + this.globalVariables.authorizationID +
      '&stockCode=' + this.globalVariables.stockCode +
      '&dateTime=' + this.datePipe.transform(new Date(), 'yyy/MM/dd') +
      '&operationType=e' +
      '&productUserCode=' + $('#productListforFiltration').val() +
      '&groupcode=' + $('#brandListForFiltration').val() +
      '&comment=' + $('#commentListForFiltration').val() +
      '&count=' + requiredDatas.count +
      '&startId=' + requiredDatas.startId).subscribe((data: any) => {
        if (data.OperationStatus == 1) {
          if (requiredDatas.count == "*" && requiredDatas.startId == "*") {
            this.datasForSupplieTable = data.Result
          }
          else {
            this.datasForSupplieTable = this.datasForSupplieTable.concat(data.Result)
          }
          this.forScrollTop = $('#mainSuppliestable_parent').scrollTop(requiredDatas.scrollTop)
        }
      })
  }

  //ბრენდების ჩატვირთვა საჭირო dropdown_ზე
  brand_filtration = []
  brand_handImport = []
  brand_billImport = []
  brand_export = []
  brand(productCode, callPlace, activeBrandCode?) {
    this.http.get(this.globalVariables.url + '/Product/GetGroups?AuthorizationId=' + this.globalVariables.authorizationID + '&productCode=' + productCode)
      .subscribe((data: any) => {
        if (data.OperationStatus == 1) {
          if (callPlace == 'suppliesTableFiltration') {
            this.brand_filtration = data.Groups
          }
          else if (callPlace == 'handImport') {
            this.brand_handImport = data.Groups
          }
          else if (callPlace == "export") {
            this.brand_export = data.Groups
          }
          else if (callPlace == 'billImport') {
            this.brand_billImport = data.Groups
          }
        }
      },
        error => {
          console.log('error')
        },
        () => {
          setTimeout(() => {
            if (callPlace == 'suppliesTableFiltration') {
              $('#brandListForFiltration').selectpicker('refresh');
            }
            else if (callPlace == 'handImport') {
              $('#brandSelectForHand').selectpicker('refresh')
              this.newRow.newRowForDropdown('brandSelectForHand')
            }
            else if (callPlace == "export") {
              $('#brand_select').selectpicker('refresh')
            }
          });
        })
  }

  //პროდუქტების სია / ასევე გამოიყენება კომენტარების dropdown_ის შესავსებად
  product_filtration = []
  comment_filtration = []

  product_handImport = []
  addEventForProduct = true
  addEventForComment = true
  addEventForExport = true
  addEventForhandImport = true

  product_export = []


  productList(dropdownType, productData, comment, stockCode?) {
    stockCode = (stockCode == undefined) ? this.globalVariables.stockCode : stockCode

    this.http.get(this.globalVariables.url + '/Product/GetProductList?AuthorizationId=' + this.globalVariables.authorizationID + '&stockCode=' + stockCode + '&productData=' + productData + '&comment=' + comment)
      .subscribe((data: any) => {
        if (data.OperationStatus == 1) {
          if (dropdownType == 'filtration_product') {
            this.product_filtration = data.Result
          }
          else if (dropdownType == 'comment') {
            this.comment_filtration = data.Result.filter(o => (o.Comment != ''))
          }
          else if (dropdownType == "handImport") {
            // this.product_handImport = data.Result.slice(0, 20)
            this.product_handImport = data.Result

            // for (let index1 = 0; index1 < 100; index1++) {
            //   for (let index = 0; index < 100; index++) {
            //     this.product_handImport.push(data.Result[index])
            //   }
            // }
            // console.log('alldone')
          }
          else if (dropdownType == 'product_select') {
            this.product_export = data.Result
            //ბრენდების dropdown_ის გასუფთავება
            this.brand_export = []
            //განზომილებების dropdown_ის გასუფთავება
            this.dimensions_list = []
          }
        }
      },
        error => {
          console.log('error')
        },
        () => {
          setTimeout(() => {
            $('#productUserCode').val('').attr('disabled', false)
            if(dropdownType != 'handImport' && dropdownType != 'brandSelectForHand'){
              $('.selectpicker').selectpicker('refresh');
            }

            let that = this,
              dropdownID = '';
            if (dropdownType == "filtration_product") {
              dropdownID = "productListforFiltration"
            }
            else if (dropdownType == "comment") {
              dropdownID = "commentListForFiltration"
            }
            else if (dropdownType == 'product_select') {
              dropdownID = "product_select"
            }
            else if (dropdownType == "handImport") {
              dropdownID = "productSelectForHand"
              this.newRow.newRowForDropdown("productSelectForHand")
            }
            else {
              return
            }




            //ვალიდაცია საჭიროა იმისათვის, რომ nput ველებზე ერთხელ დაემატოს keyup ივენთი(event)
            if (dropdownType == 'filtration_product') {
              if (!this.addEventForProduct) {
                return
              }
            }
            else if (dropdownType == 'comment') {
              if (!this.addEventForComment) {
                return
              }
            }
            else if (dropdownType == 'product_select') {
              if (!this.addEventForExport) {
                return
              }
            }
            else if (dropdownType == 'handImport') {
              if (!this.addEventForhandImport) {
                return
              }
            }



            //მოვლენა input(data-live-search) ველზე
            this.filtrationWithDropdown(dropdownID, dropdownType)
            //
            if (dropdownID == "productListforFiltration" && this.addEventForProduct) {
              this.addEventForProduct = false
            }
            else if (dropdownID == "commentListForFiltration" && this.addEventForComment) {
              this.addEventForComment = false
            }
            else if (dropdownID == "product_select" && this.addEventForExport) {
              this.addEventForExport = false
            }
            else if (dropdownID == "productSelectForHand" && this.addEventForhandImport) {
              this.addEventForhandImport = false
            }
          });
        })
  }

  filtrationWithDropdown(dropdownID, dropdownType) {
    let that = this
    $("#" + dropdownID).siblings().find(".bs-searchbox > input").keyup(function (e) {
      let thisValueText = $(this).val()
      // backspace_ზე არ გაეშვას
      if (e.keyCode == '8') {
        return
      }
      //
      if (thisValueText.length > 0 && thisValueText.length % 4 == 0 || e.keyCode == 13) {
        let product = '',
          comment = ''
        if (dropdownType == "filtration_product") {
          product = thisValueText
          comment = "*"
        }
        else if (dropdownType == "comment") {
          product = "*"
          comment = thisValueText
        }
        else if (dropdownType == "product_select") {
          product = thisValueText
          comment = '*'
        }
        else if (dropdownType == 'handImport') {
          product = thisValueText
          comment = '*'
        }

        that.productList(dropdownType, product, comment)
      }
    });
  }

  //საწყობების სია
  billImport_stockList = []
  handImport_stockList = []

  export_slockList = []

  stockServiceForHandImportIsLoaded
  loadStocks(dropdownID, exportcomponent?) {
    $('#' + dropdownID + ' option').remove().selectpicker('refresh')
    this.http.get(this.globalVariables.url + '/Stock/GetStock?stockCode=' + this.globalVariables.stockCode + '&authorizationId=' + this.globalVariables.authorizationID + '&privilegyCode=005')
      .subscribe((data: any) => {
        if (data.OperationStatus == 1) {
          if (dropdownID == 'stockList_forBill') {
            this.billImport_stockList = data.Result
          }
          else if (dropdownID == 'stockCodeForHand') {
            this.handImport_stockList = data.Result
            this.stockServiceForHandImportIsLoaded = true
          }
          else if (dropdownID == "stockSelect") {
            this.export_slockList = data.Result
            this.exportservice.getCustomer('0002', exportcomponent)
          }
        }
      },
        error => {
          console.log('error')
        },
        () => {
          setTimeout(() => {
            let x: ImportComponent
            //ავტომატური მონიშვნს იმ შემთხვევაში თუ ერთი საწყობია მიბმული user_ზე...
            $('#' + dropdownID + ' option.bs-title-option').remove()

            let t = ''
            if ($('#' + dropdownID + ' option').length == 1) {
              t = $('#' + dropdownID + ' option').eq(0).val()
            }
            $('#' + dropdownID).selectpicker('refresh');
            $('#' + dropdownID).selectpicker('val', t);

            if (dropdownID == 'stockList_forBill') {
              this.dimensions($('#' + dropdownID).val())
              this.brand("-1", 'billImport')
            }
          });
        })
  }

  //partNumber_ის გაგება
  customBillCode: any = ''
  partNumberForGenerateCodeIsLoaded

  partNumber_globally
  partNumber(operationType) {
    this.http.get(this.globalVariables.url + '/Product/GetPartNumber?authorizationId=' + this.globalVariables.authorizationID + '&operationType=' + operationType)
      .subscribe((data: any) => {
        if (data.OperationStatus == 1) {
          this.partNumberForGenerateCodeIsLoaded = true//სავარაუდოდ დაჭირდება if/else statement

          this.customBillCode = Number(Number(this.globalVariables.mainUserCode) + '00000000000000') + Number(data.Result[0].Result + '0')
          this.customBillCode = 'C' + this.customBillCode

          this.partNumber_globally = data.Result[0].Result
        }
      },
        error => {
          console.log('error')
        },
        () => {
          setTimeout(() => {
            $('#billOrCodeSelect').selectpicker('refresh')
          });
        })
  }

  //ის განზომილებები, რომლებიც მიბმულია კონკრეტულ საწყობზე
  dimensions_list = []
  dimensions(stockCode, dropdownID?) {
    this.http.get(this.globalVariables.url + '/Dimensions/GetDimension?stockCode=' + stockCode + '&authorizationId=' + this.globalVariables.authorizationID)
      .subscribe((data: any) => {
        if (data.OperationStatus == 1) {
          this.dimensions_list = data.Result
        }
      },
        error => {
          console.log('error')
        },
        () => {
          setTimeout(() => {
          });
        })
  }
}

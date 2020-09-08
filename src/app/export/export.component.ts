import { Component, OnInit, Injectable, Output, EventEmitter } from '@angular/core';
import { AppComponent } from '../app.component';
import { ReusableServicesService } from '../reusable-services.service';
import { ExportService } from './export.service';
import { GlobalVariables } from 'src/globalVariables';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';

declare var $: any;
@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.css']
})
export class ExportComponent implements OnInit {
  @Output() exportComponentEvent = new EventEmitter<any>()


  exportautocompleteImExportcomponent
  constructor(public http: HttpClient, public globalVariables: GlobalVariables, public appComponent: AppComponent, public reusableServices: ReusableServicesService, public exportServices: ExportService, public datePipe: DatePipe) {
    this.exportautocompleteImExportcomponent = appComponent.exportAutocompleteDatas
  }

  ngOnInit() {
    this.exportComponentEvent.emit(this)

    $('.selectpicker').selectpicker()

    //საწყობების ჩატვირთვა
    this.reusableServices.loadStocks("stockSelect", this)
    //ლეგალების შევსება(ფპ/შპს...)
    this.exportServices.loadLegals()
    //კლიენტის შესახებ ინფორმაციის გასუფთავება გასუფთავება
    this.exportServices.clientInformation = []
    //
    this.reusableServices.addEventForExport = true

    $('a[data-toggle="pill"]').on('show.bs.tab', function (e) {
      // if($(e.target).parent('li').index() == 1){
      // }
    })

  }


  buttonType = 'next'
  showSecondTab = true
  firstTabDatas: any = {
    stockCode: '',
    clientInformation: ''
  }

  tableDatas = []

  //tab_ების ცვლილება
  changeTab(buttonType?) {
    if (buttonType == undefined) {
      return
    }

    if (buttonType == 'next') {
      this.firstTabDatas.stockCode = $('#stockSelect').val()
      if (this.firstTabDatas.stockCode == '' || this.exportServices.clientInformation.LegalCode == undefined) {
        alert('შეავსეთ ყველა ველი.')
        return
      }

      this.firstTabDatas.clientInformation = this.exportServices.clientInformation
      $('.nav-item').eq(1).find('a').tab('show')
      this.buttonType = 'save'
      this.showSecondTab = false

      let status = false

      if (Object.keys(this.appComponent.exportAutocompleteDatas).length != 0) {
        if (this.appComponent.exportAutocompleteDatas.productCode1 == undefined || this.appComponent.exportAutocompleteDatas.productUserCode == undefined || this.appComponent.exportAutocompleteDatas.brandCode == undefined) {
          alert('შეცდომა: ავტომატური შევსება ვერ ხერხდება მონაცემების არარსებობის გამო...')
          status = true
        }
        else {
          this.exportAutocomplete()
        }
      }
      else {
        status = true
      }

      if (status) {
        //სერვისების გამოძახება
        this.reusableServices.productList('product_select', '*', '*')
        //რაოდენობა საწყობში, ველის გასუფთავება
        this.actualProductQuantity = 'რაოდენობა საწყობში'
        //
        $('#qunatity').val('')
        //
        this.exportServices.actualProductUnitPrice_fromExportService = ''
        //
        this.selectedProduct_userCode = ''
      }

    }
    else if (buttonType == 'previous') {
      $('.nav-item').eq(0).find('a').tab('show')
      this.buttonType = 'next'
    }
  }

  //საწყობის dropdown_ის ცვლილება
  changeStock() {
    this.tableDatas = []
    this.showSecondTab = true
  }

  //კლიენტის მოდალური ფორმის გახსნა
  openClientModal() {
    //მოდალური ფორმის გახსნა
    $('#addNewclient_modal').modal('show')

    //dropdown_ების მონიშვნა
    let vatStatus = this.exportServices.clientInformation.VATStatus
    let LegalCode = this.exportServices.clientInformation.LegalCode
    $('#payVat').selectpicker('val', (vatStatus == undefined) ? '' : vatStatus)
    $('#iurId').selectpicker('val', (LegalCode == undefined) ? '' : LegalCode)

    $('#payVat ,#iurId').selectpicker('refresh')
  }

  show = false
  //კლიენტის მოდალური ფორმის შენახვა
  addNewClient() {
    alert('ახალი კლიენტის დამატება დაერთებული არ არის...')
    $('#addNewclient_modal').modal('hide')
  }



  //კლიენტის ძებნა...
  searchClient(ev) {
    var text = ev.target.value,
      that = this;

    if (ev.keyCode == '13') {
      that.exportServices.getCustomer(ev.target.value)
    }
  }




  //პროდუქტის dropdown_ს ცვლილება
  actualProductQuantity = 'რაოდენობა საწყობში'
  selectedProduct_userCode = ''
  product_select_change(productCode1) {
    this.selectedProduct_userCode = this.reusableServices.product_export.filter(o => (o.ProductCode1 == productCode1))[0].ProductUserCode

    //ბრენდების ჩატვირთვა
    this.reusableServices.brand(this.selectedProduct_userCode, 'export')
  }

  //ბრენდის dropdown_ის ცვლილება
  brand_select_change(brandCode) {
    this.actualProductQuantity = 'რაოდენობა საწყობში'
    this.exportServices.actualProductUnitPrice_fromExportService = ''

    let SelectedBarCode_code = brandCode

    this.http.get(this.globalVariables.url + '/Report/GetRSum?authorizationID=' + this.globalVariables.authorizationID +
      '&stockCode=' + this.globalVariables.stockCode +
      '&dateTime=' + this.datePipe.transform(new Date(), 'yyy/MM/dd') +
      '&operationType=e' +
      '&productUserCode=' + this.selectedProduct_userCode +
      '&groupcode=' + SelectedBarCode_code +
      '&comment=*' +
      '&count=1000' +
      '&startId=1').subscribe((data: any) => {
        if (data.Result.filter(o => (o.ProductCode == this.selectedProduct_userCode)).filter(o => (o.BrandCode == SelectedBarCode_code))[0] == undefined) {
          alert('დაფიქსირდა შეცოდმა... პროდუქტი ასეთი ბრენდით არ მოიძებნა')
        }
        else {
          //პროდუქტის barcode_ს გაგება
          this.exportServices.getProductBarCode(this.firstTabDatas.stockCode, this.selectedProduct_userCode, SelectedBarCode_code)
          //რაოდენობა საწყობში...
          this.actualProductQuantity = data.Result.filter(o => (o.ProductCode == this.selectedProduct_userCode)).filter(o => (o.BrandCode == SelectedBarCode_code))[0].Quantity
        }
      })
  }

  //განზომილების ცვლილება
  dimmension_select_change(selectedDimmensionCode) {
    this.exportServices.getProductPrice(this.firstTabDatas.stockCode, selectedDimmensionCode)
  }

  //ახალი პროდუქტის დამატება ცხრილში
  addNewProductInTable() {
    let product_Name = $('#product_select option:selected').html(),
      product_Code1 = $('#product_select').val(),
      brandName = $('#brand_select option:selected').html(),
      brandCode = $('#brand_select').val(),
      dimensionCode = $('#dimension_select').val(),
      quantity = $('#qunatity').val(),
      unitPrice = this.exportServices.actualProductUnitPrice_fromExportService;


    //შემოწმება, რომ არ მოხდეს ერთი პროდუქტის ორჯერ ჩაგდება ცხრილში
    if (this.tableDatas.filter(o => (o.name.trim() == product_Name.trim())).length > 0) {
      alert('შეცდომა: ასეთი პროდუქტი უკვე დამატებულია ცხრილში')
      return
    }
    else if (quantity > this.actualProductQuantity || quantity <= 0) {
      alert('შეცდომა: არასწორი რაოდენობა')
      return
    }
    else if (this.exportServices.productBarCode == '') {
      alert('ლოკალური შეცდომა: პროდუქტის barCode არ მოიძებნა')
      return
    }

    //შემოწმება, ყველა ველი უნდა იყოს სევსებული
    if (product_Name == '' || product_Code1 == '' || brandName == '' || brandCode == '' || dimensionCode == '' || quantity == '' || unitPrice == '') {
      alert('შეავსეთ ყველა მონაცემი')
      return
    }

    //ველების გასუფთავება
    $('#step_two input').val('')
    $('#step_two .selectpicker').selectpicker('val', '').selectpicker('refresh')
    this.actualProductQuantity = 'რაოდენობა საწყობში'
    this.exportServices.actualProductUnitPrice_fromExportService = ''

    this.tableDatas.push({
      name: product_Name,
      code1: product_Code1,
      quantity: quantity,
      dimension: dimensionCode,
      unitPrice: unitPrice,
      sumPrice: Number(quantity) * Number(unitPrice),
      brandName,
      brandCode,
      barCode: this.exportServices.productBarCode
    })
  }

  //პროდუქტის წაშლა ცხრილიდან
  deleteProductFromTable(datas) {
    let thisData = this.tableDatas.filter(o => (o.name == datas.name && o.code1 == datas.code1))[0]

    if (thisData != '') {
      //პროდუქტის მონიშვნა
      $('#product_select').selectpicker('val', thisData.code1)
      this.selectedProduct_userCode = this.reusableServices.product_export.filter(o => (o.ProductCode1 == thisData.code1))[0].ProductUserCode
      //ბრენდის მონიშვნა
      $('#brand_select').selectpicker('val', thisData.brandCode)
      this.brand_select_change(thisData.brandCode)
      //განზომილება
      $('#dimension_select').selectpicker('val', thisData.dimension)
    }


    this.tableDatas = this.tableDatas.filter(o => (o.name != datas.name && o.code1 != datas.code1))
  }

  //ექსპორტის დასრულება
  saveExport() {
    if (this.tableDatas.length == 0) {
      alert('ცხრილი ცარიელია')
      return
    }

    //უნდა შეიკრიბოს მონაცემები და გადაეცეს სერვისს...
    let products = []
    for (let index = 0; index < this.tableDatas.length; index++) {
      products.push({
        "ProductCode": this.tableDatas[index].barCode, //საჭიროა barCode
        "BrandCode": this.tableDatas[index].brandCode,
        "DimensionCode": this.tableDatas[index].dimension,
        "Quantity": this.tableDatas[index].quantity,
        "UnitPrice": this.tableDatas[index].unitPrice,
        "Sum": this.tableDatas[index].sumPrice
      })
    }
    let sumAmount = this.tableDatas.map(item => item.quantity).reduce((prev, next) => Number(prev) + Number(next));
    let exportProducts = {
      "AuzorithationId": this.globalVariables.authorizationID,
      "StockCode": this.firstTabDatas.stockCode,
      "ClientCode": this.firstTabDatas.clientInformation.Code,
      "Status": '100', //თუ იპრდაპირ სრულდება ექსპორტი
      "PartNumber": '',//გამოსაძახებელია სერვისი
      "Amount": sumAmount,
      "VAT": '0', //ჭირდება კოლეჯის ვერსიას
      "PayTypes": [
        { PayTypeID: "3", Amount: sumAmount } //სამომავლოდ უნდა გადაეცეს დინამიურად
      ],
      "Products": products
    }

    console.log(exportProducts)
    //სხვანაირად ვერ გაკეთდა... გარე ფაილიდან რომ გამომეძახებინა...
    this.http.get(this.globalVariables.url + '/Product/GetPartNumber?authorizationId=' + this.globalVariables.authorizationID + '&operationType=1')
      .subscribe((data: any) => {
        if (data.OperationStatus == 1) {
          exportProducts.PartNumber = data.Result[0].Result
          this.http.post(this.globalVariables.url + '/Product/ExportProductBarCode?managerCode=' + null + '&dimensionId=3&invoiceDBID=-1', exportProducts)
            .subscribe((data: any) => {
              if (data.OperationStatus == 1) {
                this.appComponent.updateTable = true
                this.appComponent.showMainButtons = true
                this.appComponent.activeField = 'dashboard'
                this.appComponent.innerTitle = ''
              }
            })
        }
      })
  }

  //ექსპორტის დახურვა
  closeExport() {
    this.appComponent.closeCurrentForm()
  }















  //ავტომატური შევსება
  exportAutocomplete() {
    //პროდუქტის ჩატვირთვა და არჩევა
    this.http.get(this.globalVariables.url + '/Product/GetProductList?AuthorizationId=' + this.globalVariables.authorizationID +
      '&stockCode=' + this.firstTabDatas.stockCode +
      '&productData=' + this.appComponent.exportAutocompleteDatas.productUserCode +
      '&comment=*').subscribe((data: any) => {
        if (data.OperationStatus == 1) {
          this.reusableServices.product_export = data.Result
          //ბრენდების dropdown_ის გასუფთავება
          this.reusableServices.brand_export = []
          //განზომილებების dropdown_ის გასუფთავება
          this.reusableServices.dimensions_list = []
        }
      },
        error => {
          console.log('error')
        },
        () => {
          setTimeout(() => {
            $('#product_select').selectpicker('val', this.appComponent.exportAutocompleteDatas.productCode1)
            $('#product_select').selectpicker('refresh')

            if (this.reusableServices.addEventForExport) {
              this.reusableServices.filtrationWithDropdown("product_select", "product_select")
              this.reusableServices.addEventForExport = false
            }
            //ბრენდების ჩატვირთვა და არჩევა
            this.http.get(this.globalVariables.url + '/Product/GetGroups?AuthorizationId=' + this.globalVariables.authorizationID + '&productCode=' + this.appComponent.exportAutocompleteDatas.productUserCode)
              .subscribe((data: any) => {
                if (data.OperationStatus == 1) {
                  this.reusableServices.brand_export = data.Groups
                }
              },
                error => {
                  console.log('error')
                },
                () => {
                  this.actualProductQuantity = 'რაოდენობა საწყობში'
                  setTimeout(() => {
                    $('#brand_select').selectpicker('val', this.appComponent.exportAutocompleteDatas.brandCode)
                    $('#brand_select').selectpicker('refresh')
                  });
                  if (this.reusableServices.datasForSupplieTable.filter(o => (o.ProductCode == this.appComponent.exportAutocompleteDatas.productUserCode)).filter(o => (o.BrandCode == this.appComponent.exportAutocompleteDatas.brandCode))[0] == undefined) {
                    alert('დაფიქსირდა შეცოდმა... პროდუქტი ასეთი ბრენდით არ მოიძებნა')
                  }
                  else {
                    //პროდუქტის barcode_ს გაგება
                    this.http.get(this.globalVariables.url + '/Product/GetProductBarCode?authorizationId=' + this.globalVariables.authorizationID + '&stockCode=' + this.firstTabDatas.stockCode + '&productUserCode=' + this.appComponent.exportAutocompleteDatas.productUserCode + '&brandCode=' + this.appComponent.exportAutocompleteDatas.brandCode)
                      .subscribe((data: any) => {
                        if (data.OperationStatus == 1) {
                          this.exportServices.productBarCode = data.Result[0].PartNumber
                          if (this.exportServices.productBarCode == undefined) {
                            this.exportServices.productBarCode = ''
                            alert('ლოკალური შეცდომა... barCode არ მოიძებნა')
                            return
                          }
                          //პროდუქტის ერთეულის ფასი
                          this.exportServices.getProductPrice(this.firstTabDatas.stockCode)
                        }
                      })
                    //რაოდენობა საწყობში...
                    this.actualProductQuantity = this.reusableServices.datasForSupplieTable.filter(o => (o.ProductCode == this.appComponent.exportAutocompleteDatas.productUserCode)).filter(o => (o.BrandCode == this.appComponent.exportAutocompleteDatas.brandCode))[0].Quantity
                  }
                })
          });
        })
  }
}



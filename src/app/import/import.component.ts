import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AppComponent } from '../app.component';
import { extraRowForSelectpicker } from 'src/extraRowForSelectpicker';
import { ReusableServicesService } from '../reusable-services.service';
import { HttpClient } from '@angular/common/http';
import { GlobalVariables } from 'src/globalVariables';
import { ImportService } from './import.service';
import { DatePipe } from '@angular/common';
import { not } from '@angular/compiler/src/output/output_ast';

declare var $: any;

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.css']
})
export class ImportComponent implements OnInit {
  @Output() importComponentEvent = new EventEmitter<any>()


  constructor(public http: HttpClient, public appComponent: AppComponent, public newRow: extraRowForSelectpicker, public reusableServices: ReusableServicesService, public importServices: ImportService, public globalVariables: GlobalVariables, public datePipe: DatePipe) { }

  ngOnInit() {
    //მონაცემების გასუფთავებისთვის საჭიროა, რომ appComponent_ს გადაეცეს import კომპონენტი
    this.importComponentEvent.emit(this)


    this.reusableServices.partNumberForGenerateCodeIsLoaded = false
    this.reusableServices.stockServiceForHandImportIsLoaded = false
    this.reusableServices.addEventForhandImport = true
    //
    this.importServices.loadCurrencyList()

    let that = this
    $('a[data-toggle="pill"]').on('show.bs.tab', function (e) {
      $('.selectpicker').selectpicker()
    })

    $('a[data-toggle="pill"]').on('shown.bs.tab', function (e) {
      let activeTabIndex = $(e.target).parent('li').index();

      if (!that.showSecondTab) {
        that.appComponent.resizeFunctionDatas()
      }
      // if (that.importType == 'withHand') {
      //   let dropdownID = ''
      //   if (activeTabIndex == 1) {
      //     dropdownID = 'supplier'
      //   }
      //   else if (activeTabIndex == 2) {
      //     dropdownID = 'productSelectForHand'
      //   }
      //   else {
      //     return
      //   }
      //   that.newRow.newRowForDropdown(dropdownID)
      // }


    })

    //ავტომატური შევსების დროს მეორე ტაბის გააქტიურება და მასში შემავალი dropdown_ების შევსება
    if (Object.keys(this.appComponent.importAutocompleteDatas).length != 0) {
      // $('.nav-item').eq(0).find('a').tab('show')
      // this.changeTab('tabClick', 0)

      $('#withHand').click()
      this.changeImportType('withHand')

      //$('.nav-item').eq(1).find('a').tab('show')
      // this.changeTab('tabClick', 1)
    }
  }




  importType = ''
  showTable = false
  customTableHeight
  tableDatas = []
  //ტაბების დინამიური ჩვენება
  showSecondTab = true
  showThirdTab = true
  buttonType = "next"

  step_one = "იმპორტის ტიპი"

  firstStepDatasForHandImport: firstStepDatasForHandImport
  mainActiveTab = 0


  //
  changeTab(operationType, index?) {
    let activeLiIndex = $('.nav-item > a.active').parent().index(),
      activeTabManually: boolean = false;


    let validationStatus = false;
    if (operationType == "next") {
      if (this.importType == undefined || this.importType == undefined) {
        alert('აირჩიეთ იმპორტის ტიპი')
        validationStatus = true
      }
      else if (activeLiIndex == 1 && this.importType == "withHand") {
        let billOrCodeSelect = $('#billOrCodeSelect').val(),
          forBillOrCodeSelect = $('#forBillOrCodeSelect').val(),
          supplier_code = $('#supplier').val(),
          supplier_name = $('#supplier option:selected').html(),
          carNumber = $('#carNumber').val(),
          stockCodeForHand = $('#stockCodeForHand').val();

        if (billOrCodeSelect != '' && forBillOrCodeSelect != '' && supplier_code != '' && stockCodeForHand != '') {
          this.firstStepDatasForHandImport = {
            billOrCodeSelect,
            forBillOrCodeSelect,
            supplier_code,
            supplier_name,
            carNumber,
            stockCodeForHand
          }
        }
        else {
          alert('აირჩიეთ ყველა საჭირო ველი')
          validationStatus = true
        }
      }
    }

    if (validationStatus) {
      return
    }

    if (operationType == "next") {
      activeTabManually = true
      activeLiIndex = activeLiIndex + 1
    }
    else if (operationType == "previous") {
      activeTabManually = true
      activeLiIndex = activeLiIndex - 1
    }
    else if (operationType == "tabClick") {
      activeTabManually = false;
      activeLiIndex = index
    }

    this.mainActiveTab = activeLiIndex



    if (activeLiIndex == 2 && this.importType == 'widthBillNumber' || activeLiIndex == 3) {
      return
    }


    //ცხრილის გამოჩენა/გაქრობა
    if (this.importType == 'widthBillNumber' && activeLiIndex == 1) {
      this.showTable = true
      this.customTableHeight = ($('.card-body').height() - 54) + 'px'
      this.buttonType = 'save'

      //საწყობის dropdown_ის შევსება
      this.reusableServices.loadStocks("stockList_forBill")

    }
    else if (this.importType == 'withHand') {
      if (activeLiIndex == 0) {
        this.showTable = false
        this.buttonType = 'next'
      }
      else if (activeLiIndex == 1) {
        this.showTable = false
        this.buttonType = 'next'


        //მომწოდებლების შევსება
        this.importServices.loadSuppliers()

        //კოდის დაგენერირება
        if (!this.reusableServices.partNumberForGenerateCodeIsLoaded) {
          $('#billOrCodeSelect').selectpicker('val', 'customCode')
          this.reusableServices.partNumber('0')
        }

        //საწყობის dropdown_ის შევსება
        if (!this.reusableServices.stockServiceForHandImportIsLoaded) {
          this.reusableServices.loadStocks("stockCodeForHand")
        }
      }
      else if (activeLiIndex == 2) {
        this.showTable = true
        this.customTableHeight = ($('.card-body').height() - 84) + 'px'
        this.buttonType = 'save'

        let status = false
        if (Object.keys(this.appComponent.importAutocompleteDatas).length != 0) {
          // if (this.appComponent.importAutocompleteDatas.productCode1 == undefined || this.appComponent.importAutocompleteDatas.productUserCode == undefined || this.appComponent.importAutocompleteDatas.brandCode == undefined) {
          //   alert('შეცდომა: ავტომატური შევსება ვერ ხერხდება მონაცემების არარსებობის გამო...')
          //   status = true
          // }
          // else {
          //   this.importAutocomplete()
          // }
          this.importAutocomplete()
        }
        else {
          status = true
        }

        if (status) {
          //პროდუქტების ჩატვირთვა
          this.reusableServices.productList('handImport', '*', '*', this.firstStepDatasForHandImport.stockCodeForHand)
          //განზომილებების ჩატვირთვა
          this.reusableServices.dimensions(this.firstStepDatasForHandImport.stockCodeForHand)
          //ბრენდების ჩატვირთვა
          this.reusableServices.brand("-1", 'handImport')
        }
      }
    }
    else {
      this.showTable = false
      this.buttonType = 'next'
    }

    //ტაბების ცვენება დინამიურად...
    if (operationType == 'tabClick' && index == 0) {
      // this.showSecondTab = true
      // this.showThirdTab = true
      $('.nav-item').eq(index).find('a').tab('show')
    }
    else if (activeLiIndex == 1) {
      this.showSecondTab = false
    }
    else if (activeLiIndex == 2) {
      this.showThirdTab = false
    }

    //ტაბის გააქტიურება, თუ მოვლენა ხდება ისრებზე
    if (activeTabManually) {
      if (operationType == "previous" && activeLiIndex == -1) {
        return
      }

      $('.nav-item').eq(activeLiIndex).find('a').tab('show')
    }
  }

  //იმპორტის ტიპის ცვლილება step_1 ზე არსებული ღილაკების ცვლილება
  changeImportType(e) {
    this.importType = e
    this.buttonType = 'next'
    this.showSecondTab = true
    this.showThirdTab = true
    this.tableDatas = []

    //სერვისები რომ თავიდა ჩაიტვირთოს
    this.reusableServices.partNumberForGenerateCodeIsLoaded = false
    this.reusableServices.stockServiceForHandImportIsLoaded = false

    //$('.nav-item').eq(1).find('a').tab('show')
    //this.changeTab('next', undefined)

    this.changeTab('next')

    //ველების გასუფთავება მესამე საფეხურზე
    $('#step_three input').val('')
    $('#step_three .selectpicker').selectpicker('val', '').selectpicker('refresh')

    //ველების გასუფთავება მეორე საფეხურზე
    $('#step_two input').not('#forBillOrCodeSelect').val('')
    $('#step_two .selectpicker').selectpicker('val', '').selectpicker('refresh')

    //this.changeTab('tabClick', 1) ესეც იყო ჩართული... შეიძლება რაიმე bug გამოიწვიოს მისმა გათიშვამ ტესტირების პროცესში
  }


  //
  billOrCodeSelect_change(ev) {
    if (ev.target.value == 'customCode') {
      this.reusableServices.partNumber('0')
      $('#forBillOrCodeSelect').attr('disabled', true)
    }
    else if (ev.target.value == 'billNumber') {
      this.reusableServices.customBillCode = ''
      $('#forBillOrCodeSelect').attr('disabled', false)
    }
  }

  //
  changeHandStock(ev?) {
    //უნდა მოხდეს ცხრილის გასუფთავება
  }

  //მოვლენა პროდუქტების ცხრილზე, რომლის შემდეგაც ივსება ბრენდების dropdown_ი
  productSelectForHand_change(selectedProductCode) {
    if (selectedProductCode == '') {
      $('#productUserCode').val('').attr('disabled', false)
    }
    else {
      $('#productUserCode').val(this.reusableServices.product_handImport.filter(o => (o.ProductCode1 == selectedProductCode))[0].ProductUserCode).attr('disabled', true)
    }
  }

  //ვალუტის კურსის ცვლილება
  changeCurrency(ev) {
    this.importServices.activeCurrency_name = ev.target.innerHTML
    this.importServices.activeCurrency_code = ev.target.id
    $(ev.target).addClass('active').siblings().removeClass('active')
    // $(this).parents(".dropdown").find('.btn').html($(this).text() + ' <span class="caret"></span>');
    // $(this).parents(".dropdown").find('.btn').val($(this).data('value'));
  }

  //ახალი პროდუქტის დამატება ცხრილში ხელით იმპორტის დროს
  addNewProductInTableForHand() {
    let productSelectForHand_productName = $('#productSelectForHand option:selected').html(),
      productSelectForHand_productCode1 = $('#productSelectForHand').val(),
      brandNameSelectForHand = $('#brandSelectForHand option:selected').html(),
      brandCodeSelectForHand = $('#brandSelectForHand').val(),
      productUserCode = $('#productUserCode').val(),
      commentForHand = $('#commentForHand').val(),
      productQuantityForHand = $('#productQuantityForHand').val(),
      productUnitPriceForHand = $('#productUnitPriceForHand').val();

    //შემოწმება, რომ არ მოხდეს ერთი პროდუქტის ორჯერ ჩაგდება ცხრილში
    if (this.tableDatas.filter(o => (o.name.trim() == productSelectForHand_productName.trim())).length > 0 || this.tableDatas.filter(o => (o.productUserCode.trim() == productUserCode.trim())).length > 0) {
      alert('შეცდომა: ასეთი პროდუქტი უკვე დამატებულია ცხრილში')
      return
    }

    //შემოწმება, ყველა ველი უნდა იყოს სევსებული
    if (
      productSelectForHand_productName != "" &&
      brandNameSelectForHand != "" &&
      brandCodeSelectForHand != "" &&
      productQuantityForHand != "" &&
      productUnitPriceForHand != ""
    ) {
      if(this.globalVariables.visualizationForUser1){
        if(productUserCode == ""){
          alert('შეცდომა: შეიყვანეტ პროდუქტის კოდი')
          return
        }
      }
      let importDimensionCode1 = ''
      let addDisabledAttributteForDim1 = true
      let importDimensionCode2: any = []
      if (productSelectForHand_productCode1 == '') {
        if (this.reusableServices.dimensions_list.length == 1) {
          importDimensionCode1 = this.reusableServices.dimensions_list[0].Code
          addDisabledAttributteForDim1 = false

          importDimensionCode2.push(this.reusableServices.dimensions_list[0].Code)
        }
        else {
          importDimensionCode1 = ''
          addDisabledAttributteForDim1 = true
        }
      }
      else {
        importDimensionCode1 = this.reusableServices.product_handImport.filter(o => (o.ProductCode1 == $('#productSelectForHand').val()))[0].DimensionCode
        let t = this.reusableServices.product_handImport.filter(o => (o.ProductCode1 == $('#productSelectForHand').val()))[0].Dimension2

        for (let index = 0; index < t.length; index++) {
          importDimensionCode2.push(t[index].Code)
        }
      }

      //ცხრილში ახალი ჩანაწერების დამატება
      this.tableDatas.push({
        name: productSelectForHand_productName,
        productCode: productSelectForHand_productCode1,
        productUserCode: productUserCode,
        brandName: brandNameSelectForHand,
        brandCode: brandCodeSelectForHand,
        dimension1: importDimensionCode1,
        dimension2: importDimensionCode2,
        quantity: productQuantityForHand,
        unitPrice: productUnitPriceForHand,
        sum: productQuantityForHand * productUnitPriceForHand,
        carNumber: this.firstStepDatasForHandImport.carNumber,
        comment: commentForHand
      })


      setTimeout(() => {
        if (importDimensionCode1 != "") {
          $('.dimension1').eq($('.dimension1').length - 1)
            .selectpicker('val', importDimensionCode1)
            .attr('disabled', addDisabledAttributteForDim1)
        }
        if (importDimensionCode2 != '') {
          $('.dimension2').eq($('.dimension2').length - 1)
            .selectpicker('val', importDimensionCode2)
        }
        $('.dimension1').selectpicker('refresh')
        $('.dimension2').selectpicker('refresh')
      });
      //ველების გასუფთავება
      $('#step_three input').val('')
      $('#step_three .selectpicker').selectpicker('val', '').selectpicker('refresh')
    }
    else {
      alert('შეავსეთ ყველა ველი')
    }
  }

  //პროდუქტის წაშლა ცხრილიდან
  deleteProductFromTable(userCode) {
    let thisData = this.tableDatas.filter(o => (o.productUserCode == userCode))[0]

    if(thisData != ''){
      //პროდუქტის მონიშვნა
      let productCode = thisData.productCode
      $('#productSelectForHand').selectpicker('val', productCode)
      this.productSelectForHand_change(productCode)
      //ბრენდის მონიშვნა
      $('#brandSelectForHand').selectpicker('val', thisData.brandCode)
      //კომენტარი
      $('#commentForHand').val(thisData.comment)
      //რაოდენობა
      $('#productQuantityForHand').val(thisData.quantity)
      //ერტ. ფასი
      $('#productUnitPriceForHand').val(thisData.unitPrice)
    }


    this.tableDatas = this.tableDatas.filter(o => (o.productUserCode != userCode))
  }

  //იმპორტის დასრულება
  saveImport() {
    if (this.tableDatas.length == 0) {
      alert('ცხრილი ცარიელია')
      return
    }

    let sumImport
    if (this.importType == 'withHand') {
      //შემოწმება, არის თუ არა ყველა განზომილება არჩეული.
      if (this.tableDatas.filter(o => (o.dimension1 == '' || o.dimension2 == '')).length != 0) {
        alert('აირჩიეთ განზომილებები')
        return
      }


      let products = [],
        sumPaymentAmount = 0

      for (let index = 0; index < this.tableDatas.length; index++) {
        let dimension2 = []
        for (let i = 0; i < this.tableDatas[index].dimension2.length; i++) {
          dimension2.push({
            DimensionCode: this.tableDatas[index].dimension2[i]
          })
        }
        products.push({
          "ProductName": this.tableDatas[index].name,
          "ProductCode": this.tableDatas[index].productCode,
          "ProductUserCode": this.tableDatas[index].productUserCode,
          "AccountNumber": this.tableDatas[index].brandCode,
          "DimensionCode1": this.tableDatas[index].dimension1,
          "ExpDimensions": dimension2,
          "Quantity": this.tableDatas[index].quantity,
          "UnitPrice": this.tableDatas[index].unitPrice,
          "Sum": this.tableDatas[index].sum,
          "CarNumber": this.tableDatas[index].carNumber,
          "Comment": this.tableDatas[index].comment
        })

        sumPaymentAmount += this.tableDatas[index].sum
      }

      sumImport = {
        "AuzorithationId": this.globalVariables.authorizationID,
        "StockCode": this.firstStepDatasForHandImport.stockCodeForHand,
        "SupplierCode": this.firstStepDatasForHandImport.supplier_code,
        "SupplierName": this.firstStepDatasForHandImport.supplier_name,
        "Status": "1", //ზუსტად არ ვიცი...
        "PartNumber": '',
        "OperationType": "0", //თუ იმპორტი ზედნადებით მოხდება OperationType == 1
        "BillNumber": this.firstStepDatasForHandImport.forBillOrCodeSelect,
        "Nat": "",//საჭიროა კოლეჯის ვარიანტისთვის
        "PayTypes": [
          { PayTypeID: "3", Amount: sumPaymentAmount } //სამომავლოდ უნდა გადაეცეს დინამიურად
        ],
        "CurrencyCode": $('#currencyDropdown li.active').attr('id'),
        "Products": products
      }
    }
    else if (this.importType == 'widthBillNumber') {
      if (this.tableDatas.filter(o => o.userCode == '' || o.userCode == undefined ||
        o.brandName == '' || o.brandName == undefined ||
        o.brandCode == '' || o.brandCode == undefined ||
        o.dimension1 == '' || o.dimension1 == undefined ||
        o.dimension2 == '' || o.dimension2 == undefined).length > 0) {
        alert('შეავსეთ ყველა მონაცემი')
        return
      }
      else if (this.tableDatas.filter(o => o.quantity == 0).length > 0) {
        alert('შეცომა: არასწორი რაოდენობა')
        return
      }
      else if (this.tableDatas.filter(o => o.unitPrice == 0).length > 0) {
        alert('შეცომა: არასწორი ერთეულის ფასი')
        return
      }

      let products = []

      for (let index = 0; index < this.tableDatas.length; index++) {
        let dimension2 = []
        for (let i = 0; i < this.tableDatas[index].dimension2.length; i++) {
          dimension2.push({
            DimensionCode: this.tableDatas[index].dimension2[i]
          })
        }
        products.push({
          "ProductName": this.tableDatas[index].name,
          "ProductCode": this.tableDatas[index].productCode1,
          "ProductUserCode": this.tableDatas[index].userCode,
          "AccountNumber": this.tableDatas[index].brandCode,
          "DimensionCode1": this.tableDatas[index].dimension1,
          "ExpDimensions": dimension2,
          "Quantity": this.tableDatas[index].quantity,
          "UnitPrice": this.tableDatas[index].unitPrice,
          "Sum": this.tableDatas[index].sum,
          "CarNumber": "",
          "Comment": ""
        })

      }

      sumImport = {
        "AuzorithationId": this.globalVariables.authorizationID,
        "StockCode": this.billImportPAramaters.saveStockCodeInBillNumber,
        "SupplierCode": this.billImportPAramaters.providerCode,
        "SupplierName": this.billImportPAramaters.provideName,
        "Status": "1",
        "PartNumber": '',
        "OperationType": "1",
        "BillNumber": this.billImportPAramaters.saveBillNumber,
        "Nat": "",
        "PayTypes": [
          { PayTypeID: "3", Amount: this.tableDatas.map(item => item.sum).reduce((prev, next) => prev + next) } //სამომავლოდ უნდა გადაეცეს დინამიურად
        ],
        "CurrencyCode": "001",
        "Products": products
      }
    }

    if (sumImport == '' || sumImport == undefined) {
      alert('გაუთვალისწინებელი შეცდომა... ველები არ არის შევსებული')
      return
    }

    //import
    this.http.get(this.globalVariables.url + '/Product/GetPartNumber?authorizationId=' + this.globalVariables.authorizationID + '&operationType=0')
      .subscribe((data: any) => {
        if (data.OperationStatus == 1) {
          let localPartNumber = data.Result[0].Result

          //partNumber_ს მინიჭება
          sumImport.PartNumber = localPartNumber
          if (this.importType == 'withHand') {
            sumImport.BillNumber = ''
            sumImport.BillNumber = Number(Number(this.globalVariables.mainUserCode) + '00000000000000') + Number(localPartNumber + '0')
            sumImport.BillNumber = 'C' + sumImport.BillNumber
          }

          //ახალი პროდუქტებისთვის productCode_ს დაგენერირება
          for (let index = 0; index < sumImport.Products.length; index++) {
            if (sumImport.Products[index].ProductCode == '') {
              let customProductCode1: any

              var count = localPartNumber + (index)
              var y1 = Number(count)
              var z1 = Number(this.globalVariables.mainUserCode)

              var yz1
              yz1 = '0'
              for (var isc1 = 0; isc1 < 16 - String(this.globalVariables.mainUserCode).length - 1; isc1++) {
                yz1 += 0
              }
              customProductCode1 = Number(z1 + yz1) + y1
              customProductCode1 = 'C' + customProductCode1
              y1 = y1 + 1

              sumImport.Products[index].ProductCode = customProductCode1
            }
          }

          console.log(sumImport)
          //იმპორტი
          this.http.post(this.globalVariables.url + '/Product/ImportProduct?managerCode=' + null, sumImport)
            .subscribe((data: any) => {
              if (data.OperationStatus == 1) {
                this.appComponent.updateTable = true

                this.appComponent.showMainButtons = true
                this.appComponent.activeField = 'dashboard'
                this.appComponent.innerTitle = ''
                return
                if (this.importType == 'widthBillNumber') {
                }
                return
                console.log('error')
                this.http.get(this.globalVariables.url + '/Product/GetProductList?AuthorizationId=' + this.globalVariables.authorizationID + '&stockCode=' + this.firstStepDatasForHandImport.stockCodeForHand)
                  .subscribe((data: any) => {
                    if (data.OperationStatus == 1) {
                      //ავტომატური ჩაშლის გაკეთება და რეალიზაციის ფასის ავტომატური გაწერა... სამომავლოდ უნდა გადაკეთდეს, რადგან სერვისები ტრიალებს ციკლში...
                      this.http.get(this.globalVariables.url + '/Product/GetProductList?AuthorizationId=' + this.globalVariables.authorizationID + '&stockCode=' + this.firstStepDatasForHandImport.stockCodeForHand)
                        .subscribe((data: any) => {
                          if (data.OperationStatus == 1) {
                            let sum = []
                            for (let i = 0; i < this.tableDatas.length; i++) {
                              let productList = data.Result.filter(o => (o.ProductUserCode.trim() == this.tableDatas[i].productUserCode))
                              if (productList != '') {
                                for (let j = 0; j < productList.length; j++) {
                                  sum.push(productList[j])
                                }
                              }
                            }

                            for (let i = 0; i < sum.length; i++) {
                              let productCode1 = sum[i].ProductCode1
                              this.http.get(this.globalVariables.url + '/Product/GetBarCode?authorizationID=' + this.globalVariables.authorizationID + '&stockCode=' + this.firstStepDatasForHandImport.stockCodeForHand + '&dateTime=' + this.datePipe.transform(new Date(), 'yyy/MM/dd') + '&productCode1=' + productCode1)
                                .subscribe((data: any) => {
                                  if (data.OperationStatus == 1) {
                                    var checkStatus = false,
                                      code = '',
                                      count: any = '',
                                      barCodeName = '',
                                      status = '';

                                    if (data.Result[0].BarCodeDetails == '') {
                                      if (data.Result[0].Quantity > 0) {
                                        checkStatus = true;
                                        code = '';
                                        count = data.Result[0].Quantity;
                                        barCodeName = data.Result[0].ProductName;
                                        status = null;
                                      }
                                    }
                                    else {
                                      if (data.Result[0].Quantity > 0) {
                                        checkStatus = true;
                                        code = data.Result[0].BarCodeDetails[0].Code;
                                        count = Number(data.Result[0].Quantity) + Number(data.Result[0].BarCodeDetails[0].Count);
                                        barCodeName = data.Result[0].BarCodeDetails[0].BarCodeName;
                                        status = data.Result[0].BarCodeDetails[0].ID;
                                      }
                                    }

                                    if (checkStatus) {
                                      this.http.post(this.globalVariables.url + '/Product/SaveBarCode?' +
                                        'productCode1=' + productCode1 +
                                        '&code=' + code +
                                        '&count=' + count +
                                        '&barCodeName=' + barCodeName +
                                        '&authorizationID=' + this.globalVariables.authorizationID +
                                        '&status=' + status, '')
                                        .subscribe((data: any) => {
                                          if (data.OperationStatus == 1) {

                                            let barCode = data.Result[0].Code

                                            if (barCode == '' || barCode == undefined || barCode == null) {
                                              alert('დაფიქსირდა შეცოდა: რეალიზაციის ფასის ავტომატურად გაწერა ვერ მოხერხდა')
                                            }
                                            else {
                                              //ყველა პროდუქტს ანიჭებს რეალიზაციის ფასს-1₾... შეიძლება შემოწმებ, რომ თუ პროდუქტს უკვე გაწერილი აქვს რეალიზაციის ფასი, აღარ მიანიჭოს ახალი.
                                              let saveExpUnitPrice = [["exportRow0", 1, barCode, "073"]]


                                              var RList = []

                                              for (var i = 0; i < saveExpUnitPrice.length; i++) {
                                                RList.push({
                                                  DimensionCode: saveExpUnitPrice[i][3],
                                                  ProductCode: saveExpUnitPrice[i][2],
                                                  UnitPrice: saveExpUnitPrice[i][1],
                                                  UnitPriceValidity: true,
                                                })
                                              }



                                              var param = {
                                                AutorizationID: this.globalVariables.authorizationID,
                                                RList
                                              }

                                              var status = 0
                                              for (var i = 0; i < param.RList.length; i++) {
                                                if (param.RList[i].UnitPrice <= 0) {
                                                  status = 1
                                                  break
                                                }
                                              }

                                              if (status == 0) {
                                                this.http.post(this.globalVariables.url + '/Product/SetProductPrice', param)
                                                  .subscribe((data: any) => {
                                                    if (data.OperationStatus == 1) {
                                                      this.appComponent.showMainButtons = true
                                                      this.appComponent.activeField = 'dashboard'
                                                      this.appComponent.innerTitle = ''
                                                    }
                                                  })
                                              }
                                            }
                                          }
                                        })
                                    }
                                  }
                                })
                            }
                          }
                        });
                    }
                  })
              }
            })
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

    /*
    this.http.post(this.globalVariables.url + '/Product/ImportProduct?managerCode=' + null, sumImport)
      .subscribe((data: any) => {
        if (data.OperationStatus == 1) {
          this.http.get(this.globalVariables.url + '/Product/GetProductList?AuthorizationId=' + this.globalVariables.authorizationID + '&stockCode=' + this.firstStepDatasForHandImport.stockCodeForHand)
            .subscribe((data: any) => {
              if (data.OperationStatus == 1) {
                this.appComponent.showMainButtons = true
                this.appComponent.activeField = 'dashboard'
                this.appComponent.innerTitle = ''
              }
            })
        }
      })
      */
  }

  //იმპორტის დახურვა
  closeImport() {
    this.appComponent.closeCurrentForm()
  }



  //ახალი მომწოდებლის დამატება
  addNewCustomer() {
    $('#addNewSupplier_modal').modal('hide')

    $(`#supplier .supplier_addItem`).remove()
    $('#supplier').append(`<option value="${$('#newSupplierCode').val()}" selected>${$('#newSupplierCode').attr('name')}</option>`).selectpicker('refresh')

    //
    this.newRow.newRowForDropdown("supplier")
  }

  //განზომილების dropdown_ის ცვლილება (dimension1/dimension2)
  dimension_change(ev, productName, dimStatus) {
    let dimensionDropdownValue = $('#' + ev.target.id).val()
    if (dimStatus == "dim1") {
      this.tableDatas.filter(o => (o.name == productName))[0].dimension1 = dimensionDropdownValue
    }
    else if (dimStatus == "dim2") {
      this.tableDatas.filter(o => (o.name == productName))[0].dimension2 = dimensionDropdownValue
    }
  }


























  //
  importAutocomplete() {
    //პროდუქტების dropdown_ის შევსება და მონიშვნა
    this.http.get(this.globalVariables.url + '/Product/GetProductList?AuthorizationId=' + this.globalVariables.authorizationID + '&stockCode=' + this.firstStepDatasForHandImport.stockCodeForHand + '&productData=' + this.appComponent.importAutocompleteDatas.productUserCode + '&comment=*')
      .subscribe((data: any) => {
        if (data.OperationStatus == 1) {
          this.reusableServices.product_handImport = data.Result
        }
      },
        error => {
          console.log('error')
        },
        () => {
          setTimeout(() => {
            $('#productUserCode').val(this.appComponent.importAutocompleteDatas.productUserCode).attr('disabled', true)
            $('#productSelectForHand').selectpicker('val', this.appComponent.importAutocompleteDatas.productCode1);
            $('#productSelectForHand').selectpicker('refresh');
            this.newRow.newRowForDropdown("productSelectForHand")
            this.reusableServices.filtrationWithDropdown("productSelectForHand", "handImport")
            this.reusableServices.addEventForhandImport = false
          })

          //ბრენდების ჩატვირთვა და მონიშვნა
          this.http.get(this.globalVariables.url + '/Product/GetGroups?AuthorizationId=' + this.globalVariables.authorizationID + '&productCode=-1')
            .subscribe((data: any) => {
              if (data.OperationStatus == 1) {
                this.reusableServices.brand_handImport = data.Groups
              }
            },
              error => {
                console.log('error')
              },
              () => {
                setTimeout(() => {
                  $('#brandSelectForHand').selectpicker('val', this.appComponent.importAutocompleteDatas.brandCode);
                  $('#brandSelectForHand').selectpicker('refresh');
                  this.newRow.newRowForDropdown('brandSelectForHand')
                })

                //განზომილებების ჩატვირთვა
                this.http.get(this.globalVariables.url + '/Dimensions/GetDimension?stockCode=' + this.firstStepDatasForHandImport.stockCodeForHand + '&authorizationId=' + this.globalVariables.authorizationID)
                  .subscribe((data: any) => {
                    if (data.OperationStatus == 1) {
                      this.reusableServices.dimensions_list = data.Result
                    }
                  },
                    error => {
                      console.log('error')
                    },
                    () => {
                      setTimeout(() => {
                        $('#dimension_select').selectpicker('refresh')
                      });
                    })
              })
        })
  }
  // this.appComponent.importAutocompleteDatas

  //ზედნადების ძებნა
  billImportPAramaters = {
    saveBillNumber: '',
    saveStockCodeInBillNumber: '',
    provideName: '',
    providerCode: ''
  }
  searchInvoice(invoiceNumber) {
    this.tableDatas = []
    this.billImportPAramaters.saveBillNumber = invoiceNumber.value
    if (this.billImportPAramaters.saveBillNumber == '') {
      alert('შეიყვანეთ ზედნადების ნომერი')
      return
    }

    this.http.get(this.globalVariables.url + '/Product/FindWayBill?billNumber=' + this.billImportPAramaters.saveBillNumber + '&authorizationID=' + this.globalVariables.authorizationID + '&operationType=1')
      .subscribe((data: any) => {
        if (data.OperationStatus == 1) {
          invoiceNumber.value = ''
          this.billImportPAramaters.saveStockCodeInBillNumber = $('#stockList_forBill').val()
          this.billImportPAramaters.provideName = data.Result[0].ProviderName
          this.billImportPAramaters.providerCode = data.Result[0].ProviderCode

          let products = data.Result[0].Products
          for (let index = 0; index < products.length; index++) {
            this.tableDatas.push({
              name: products[index].ProductName,
              userCode: products[index].ProductCode,
              quantity: products[index].Quantity,
              unitPrice: products[index].UnitPrice,
              sum: products[index].Quantity * products[index].UnitPrice
            })
          }

          setTimeout(() => {
            $('.dimension1, .dimension2').attr('disabled', true).selectpicker('refresh')
            $('.brands').selectpicker('refresh')
            setTimeout(() => {
              for (let index = 0; index < $('select.brands').length; index++) {
                let brandID = $('select.brands').eq(index).attr('id')
                this.newRow.newRowForDropdown(brandID)
              }
            })
          })
        }
      })







  }

  //ბრენდის dropdown_ის ცვლილება ზედნადებით მიღების ფორმაზე
  brandForBillNumber_change(ev, index) {
    this.http.get(this.globalVariables.url + '/Product/GetProductList?AuthorizationId=' + this.globalVariables.authorizationID + '&stockCode=' + this.billImportPAramaters.saveStockCodeInBillNumber + '&productData=' + this.tableDatas[index].name + '&comment=*')
      .subscribe((data: any) => {
        if (data.OperationStatus == 1) {
          let productCode = '',
            productCode1 = '',
            dimension1 = '',
            dimension2 = [];

          //dimension1/dimension2_ის ავტომატური მონიშვნა თუ ერთი განზომილებაა მიბმული stock_ზე
          if (this.reusableServices.dimensions_list.length == 1) {
            let firstDim1 = this.reusableServices.dimensions_list[0].Code
            $('#dimension1_' + index).selectpicker('val', firstDim1)
            dimension1 = firstDim1

            $('#dimension2_' + index).selectpicker('val', firstDim1)
            dimension2.push(firstDim1);
          }
          else{
            
          }

          //
          $('#dimension1_' + index + ', #dimension2_' + index).attr('disabled', false).selectpicker('refresh')

          if (data.Result != '') {
            productCode = data.Result[0].ProductCode
            productCode1 = data.Result[0].ProductCode1
            dimension1 = data.Result[0].DimensionCode
            dimension2 = data.Result[0].Dimension2.map(a => a.Code)

            $('#dimension1_' + index).selectpicker('val', dimension1).attr('disabled', true).selectpicker('refresh')
            $('#dimension2_' + index).selectpicker('val', dimension2)
          }

          this.tableDatas[index].productCode1 = productCode1
          this.tableDatas[index].brandName = $(ev.target).find('option:selected').html()
          this.tableDatas[index].brandCode = ev.target.value
          this.tableDatas[index].dimension1 = dimension1
          this.tableDatas[index].dimension2 = dimension2
        }
      })
  }
}

export interface firstStepDatasForHandImport {
  billOrCodeSelect: string,
  forBillOrCodeSelect: string,
  supplier_code: string,
  supplier_name: string,
  carNumber: string,
  stockCodeForHand: string
}

// interface tableDatas {
//   productName: string,
//   productCode: string,
//   productUserCode: string,
//   brandCode: string,
//   dimension1: string,
//   dimension2: [],
//   quantity: string,
//   unitPrice: string,
//   sum: string,
//   carNumber: string
//   comment: string
// }






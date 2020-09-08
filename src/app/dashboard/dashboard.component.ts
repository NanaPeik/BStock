import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { HttpClient } from '@angular/common/http';
import { GlobalVariables } from 'src/globalVariables';
import { ReusableServicesService } from '../reusable-services.service';

declare var $: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  constructor(public appComponent: AppComponent, public http: HttpClient, public globalVariables: GlobalVariables, public reusableServices: ReusableServicesService) { }
  datasForTurnover = []
  showFiltration = false
  ngAfterViewInit() {
    if (this.globalVariables.activeTabID == '') {
      this.globalVariables.activeTabID = $('ul.customNavTabStyles_globall > li:visible').eq(0).find('a').attr('href')
    }
    $("a[href='" + this.globalVariables.activeTabID + "']").click()

    if (this.appComponent.updateTable && this.globalVariables.activeTabID == '#mainSupplies') {
      $("a[href='" + this.globalVariables.activeTabID + "']").click()
      this.activeSupplieTab({ count: '*', startId: '*', scrollTop: 0 })
    }

    //სერვისების ჩატვირთვა მარაგების ტაბისთვის
    if (this.globalVariables.activeTabID == '#mainSupplies') {
      this.reusableServices.addEventForProduct = true
      this.reusableServices.addEventForComment = true
      this.callMainServicesForSuppliesTab()
    }
  }
  tabs = {
    showtenderTab: true,
    showSuppliesTab: true
  }


  ngOnInit() {
    
    for (let i = 0; i < this.globalVariables.showButtonsList.length; i++) {
      if (this.globalVariables.showButtonsList[i] == 'tenders') {
        this.tabs.showtenderTab = false
      }
      else if (this.globalVariables.showButtonsList[i] == 'mainSupplyTab') {
        this.tabs.showSuppliesTab = false
      }
    }

  }

  //
  callMainServicesForSuppliesTab() {
    //
    this.reusableServices.brand("-1", 'suppliesTableFiltration')
    //
    this.reusableServices.productList("filtration_product", "-", "-")
    //
    this.reusableServices.productList("comment", "-", "-")
  }


  //მარაგების ტაბზე არსებული ცხრილის scroll
  mainSuppliestable_scroll(ev) {
    if ($(ev.target)[0].clientHeight < $(ev.target)[0].scrollHeight) {//ხდება შემოწმება div_ს აქვს თუ არა scroll_ი
      if ($(ev.target).scrollTop() + $(ev.target).innerHeight() >= $(ev.target)[0].scrollHeight) {//თუ scroll_ი ბოლოშია...
        let saveScrollPosition = $(ev.target)[0].scrollTop

        this.activeSupplieTab({
          count: 100,
          startId: $('#mainSupplies_table tbody tr').length,
          scrollTop: saveScrollPosition
        })
      }
    }
  }

  //მარაგების ტაბის გააქტიურება და ცხრილის შევსება
  activeSupplieTab(requiredDatas, ev?) {
    this.globalVariables.activeTabID = '#mainSupplies'
    //this.callMainServicesForSuppliesTab() დროებით არის გათიშული შეიძლება დაგვჭირდეს

    //
    if (ev != undefined) {
      $('#productListforFiltration, #brandListForFiltration, #commentListForFiltration').selectpicker('val', '*')
      $('#productListforFiltration, #brandListForFiltration, #commentListForFiltration').selectpicker('refresh')
    }
    //if (ev == undefined || ev.target.tagName != 'LI') {
    this.reusableServices.loadSuppliesTable(requiredDatas)
    //}

    $('a[href="#mainSupplies"]').tab('show')
    this.showFiltration = true
  }

  //ტენდერების ტაბის გააქტიურება
  activeTenderTab(ev) {
    this.globalVariables.activeTabID = '#mainTenders'
    $('a[href="#mainTenders"]').tab('show')
    this.showFiltration = false
  }

  //ფილტრაციის ველების ცვლილება
  changeSuppliesTablefiltration(ev) {//selectpicker ორ ცვლადიანი ფუნქცია როგორ მუშაობს??? google it!!
    let targetID = ev.target.id,
      targetValue = ev.target.value;

    $('#mainSupplies_table > thead .selectpicker').selectpicker('val', '*')
    $('#mainSupplies_table > thead #' + targetID).selectpicker('val', targetValue)

    //ცხრილის შევსება
    this.activeSupplieTab({ count: '*', startId: '*', scrollTop: 0 })
  }




  //მოდალური ფორმის გახსნა, საიდანაც ხდება ინფორმაციის ცვლილება კონკრეტულ პროდუქტზე
  parameterChangeDatas: any = {}
  changeProductInformation(datas) {
    $('#changeProductParameters_modal').modal('show')
    $('#changeProductParameters_modal input.new').val('')
    datas.comment = (datas.comment == '') ? 'კომენტარი' : datas.comment
    this.parameterChangeDatas = datas
  }

  //
  save_changeProductParametersModal(datas) {
    let newName = (datas.new_productName == '') ? datas.old_productName : datas.new_productName,
      newUserCode = (datas.new_productUserCode == '') ? datas.old_productUserCode : datas.new_productUserCode,
      newUnitPrice = (datas.new_productUnitPrice == '') ? datas.old_productUnitPrice : datas.new_productUnitPrice,
      newComment = (datas.new_productComment == '') ? datas.old_productComment : datas.new_productComment;


    this.http.get(this.globalVariables.url + '/Product/UpdateProduct?oldProductUserCode=' + datas.old_productUserCode +
      '&productUserCode=' + newUserCode +
      '&ProductName=' + newName +
      '&unitprice=' + newUnitPrice +
      '&authorizationID=' + this.globalVariables.authorizationID +
      '&comment=' + newComment)
      .subscribe((data: any) => {
        if (data.OperationStatus == 1) {
          $('#changeProductParameters_modal').modal('hide')
          this.reusableServices.loadSuppliesTable({ count: '*', startId: '*', scrollTop: 0 })//ცოტა გაუგებარია______________????
        }
      })
  }

  //მოდალური ფორმის გახსნა, საიდანაც ხდება ბრუნვის(შესყიდვა/რეალიზაციის) ისტორიის ნახვა კონკრეტული პროდუქტის მიხედვით
  productTurnoverInformation(userCode, brandCode) {
    this.datasForTurnover = []
    $('#productDetailTurnover_modal').modal('show')
    this.http.get(this.globalVariables.url + '/Product/GetProductDetails?userCode=' + userCode + '&status=*&authorizationID=' + this.globalVariables.authorizationID + '&brandCode=' + brandCode)
      .subscribe((data: any) => {
        if (data.OperationStatus == 1) {
          let customDatas = data.Result
          for (let index = 0; index < customDatas.length; index++) {
            customDatas[index].productUserCode = userCode
            customDatas[index].sum = customDatas[index].Quantity * customDatas[index].UnitPrice
            customDatas[index].color = (customDatas[index].Status == "Import") ? "#28a745" : "rgb(9, 173, 255)"
            customDatas[index].Status = (customDatas[index].Status == "Import") ? "იმპორტი" : "ექსპორტი"
            customDatas[index].Date = customDatas[index].Date.replace('T', ' ')
          }
          this.datasForTurnover = customDatas
        }
      })
  }
}
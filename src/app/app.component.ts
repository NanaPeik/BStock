import { Component, OnInit } from '@angular/core';
import { GlobalVariables } from 'src/globalVariables';
import { HttpClient } from '@angular/common/http';
import { ReturnComponent } from './return/return.component';

declare var $: any;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  showMainButtons: boolean = true;
  activeField = ""
  innerTitle = ''

  constructor(private http: HttpClient, public globalVariables: GlobalVariables) {

  }
  RemoveFrom
  RedoForm
  showRemoveComponent() {
    this.RedoForm = false
    this.RemoveFrom = true
  }
  showRedoComponent() {
    this.RemoveFrom = false
    this.RedoForm = true
  }
  
  importComponent: any = ''
  receiveImportComponent(ev) {
    this.importComponent = ev
  }
  exportComponent: any = ''
  receiveExportComponent(ev) {
    this.exportComponent = ev
  }

  //
  clearForms() {
    if (this.activeField == "import") {
      this.importComponent.importType = ''
      this.importComponent.buttonType = 'next'
      this.importComponent.showSecondTab = true
      this.importComponent.showThirdTab = true
      this.importComponent.tableDatas = []

      //სერვისები რომ თავიდა ჩაიტვირთოს
      this.importComponent.reusableServices.partNumberForGenerateCodeIsLoaded = false
      this.importComponent.reusableServices.stockServiceForHandImportIsLoaded = false

      //ველების გასუფთავება მესამე საფეხურზე
      $('#step_three input').val('')
      $('#step_three .selectpicker').selectpicker('val', '').selectpicker('refresh')

      //ველების გასუფთავება მეორე საფეხურზე
      $('#step_two input').val('')
      $('#step_two .selectpicker').selectpicker('val', '').selectpicker('refresh')

      //პირველ ტაბზე არსებული ველების გასუფთავება
      $('label').removeClass('active')

      //პირველი ტაბის გააქტიურება
      this.importComponent.changeTab('tabClick', 0)
    }
    else if (this.activeField == "export") {
      $('.nav-item').eq(0).find('a').tab('show')
      this.exportComponent.tableDatas = []
      this.exportComponent.buttonType = 'next'
      this.exportComponent.showSecondTab = true
      this.exportComponent.reusableServices.loadStocks("stockSelect", this.exportComponent)
    }
  }



  buttons = {
    showImportButton: false,
    showExportButton: false,
    showReturnButton: false,
    showRedoButton:false
  }
  //
  resizeFunctionDatas() {
    function hasVerticalScrollbar(elementID) {
      let element = document.getElementById(elementID)

      return element.scrollHeight > element.clientHeight;
    }
    if (this.activeField == "import") {
      if ($("a[href='#step_two']").hasClass('active')) {
        if ($('#importTable_parent')[0] != null) {
          $('#step_two').css('transform', '')
        }
        else if (hasVerticalScrollbar('main-cardBody')) {
          $('#step_two').css('transform', 'translateY(1vh)')
        }
        else if (!hasVerticalScrollbar('main-cardBody')) {
          $('#step_two').css('transform', 'translateY(5vh)')
        }
      }
    }
  }

  ngOnInit() {
    if (this.globalVariables.authorizationID == "") {
      this.globalVariables.authorizationID = new URL(window.location.href).searchParams.get("key")
    }

    this.http.get(this.globalVariables.url + '/Authorization/GetAuthorization?authorizationId=' + this.globalVariables.authorizationID)
      .subscribe((data: any) => {
        if (data.OperationStatus == 1) {
          this.globalVariables.stockCode = data.GroupPrivilegies.StockCode
          this.globalVariables.mainUserCode = data.GroupPrivilegies.UserCode

          this.globalVariables.showButtonsList = data.GroupPrivilegies.ClientPrivilegyCodes
          this.globalVariables.activeTabID = ''

          this.globalVariables.userName = data.GroupPrivilegies.UserFullName

          //ზედა პანელზე არსებული ღილაკების გამოჩენა
          this.buttons.showReturnButton = true;
          this.buttons.showRedoButton = true;
          for (let i = 0; i < this.globalVariables.showButtonsList.length; i++) {
            if (this.globalVariables.showButtonsList[i] == 'importProductBtn') {
              this.buttons.showImportButton = true
            }
            else if (this.globalVariables.showButtonsList[i] == 'exportProductBtn') {
              this.buttons.showExportButton = true
            }
            // else if (this.globalVariables.showButtonsList[i] == 'returnProductBtn') {
            //   this.buttons.showReturnButton = true
            // }
          }

          this.activeField = "dashboard"
        }
      })




    let that = this;
    $(window).resize(function () {
      that.resizeFunctionDatas()
    })


  }
  // showreturnform = false;
  // showReturnForm() {
    
  // }
  //
  exportAutocompleteDatas: any = {}
  importAutocompleteDatas: any = {}
  returnAutocompliteDatas: any = {}

  updateTable = true
  mainButtonsClick(activeField, titleName, datas?) {
    this.showMainButtons = false
    this.activeField = activeField
    this.innerTitle = titleName

    if (activeField == "export") {
      if (datas == undefined) {
        this.exportAutocompleteDatas = {}
      }
      else {
        this.exportAutocompleteDatas = datas
      }
    }
    else if (activeField == "import") {
      if (datas == undefined) {
        this.importAutocompleteDatas = {}
      }
      else {
        this.importAutocompleteDatas = datas
      }
    }
    // else if (activeField = "remove") {
    //   //
    // }
    this.updateTable = false
  }
//
  //
  closeCurrentForm() {
    this.showMainButtons = true
    this.activeField = 'dashboard'
    this.innerTitle = ''
  }

  //გასვლა    ყველაფერს ანულებს და url ში წერს გუგლის მისამართს
  logOut() {
    this.http.get(this.globalVariables.url + '/Authorization/LogOut?authorizationID=' + this.globalVariables.authorizationID)
    .subscribe((data: any) => {
        if (data.OperationStatus == 1 || data.OperationStatus == -4) {
          this.globalVariables.url = ""
          this.globalVariables.authorizationID = ""
          this.globalVariables.stockCode = ""
          this.globalVariables.mainUserCode = ""
          this.globalVariables.showButtonsList = []
          this.globalVariables.activeTabID = ""
          this.globalVariables.userName = ""
          
          let url = (this.globalVariables.windowLocationOrigin == "http://localhost:4200") ? "https://www.google.com" : this.globalVariables.windowLocationOrigin
          window.location.replace(url)
        }
      })
  }
  showretfrom() { };
}


import { Component, OnInit, Injectable, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalVariables } from 'src/globalVariables';
import { AppComponent } from '../app.component';
import { MatInput } from '@angular/material';
import { analyzeAndValidateNgModules } from '@angular/compiler';

declare var $: any;
const component = this;
@Component({
  selector: 'app-return',
  templateUrl: './return.component.html',
  styleUrls: ['./return.component.css']
})
@Injectable({
  providedIn: 'root'
})
export class ReturnComponent implements OnInit {
  status = -1;
  firstdate = '';
  lastdate = '';
  companycode = '';
  partynumber = '';
  productCode = '';
  mainDate = [];
  companyarray: any;
  partynumberarray: any;
  titleOfForm
  firstServiceForDropdown
  secondServiceForDropdown
  fillTableService
  lastService
  SaveService


  constructor(private appComponent: AppComponent, private http: HttpClient, public globalVariables: GlobalVariables) { }

  clearFirstInputDate
  clearSecondInputDate
  ngOnInit() {
    let that = this;
    
    $('#turnReturnModal').on('hide.bs.modal', function () {
      that.clearform();
    }).on('show.bs.modal', function () {
      if (that.appComponent.RemoveFrom == true) {
        $('#turnReturnModalTitle').html("პროდუქტის მიბრუნება");
      } else if (that.appComponent.RedoForm == true) {
        $('#turnReturnModalTitle').html("პროდუქტის მობრუნება");
      }
    })
  }

 //იძახებს firstServiceForDropdown სერვისს companyarrayის შეასვსებად (გადმოვიტანეთ ngOnInit ფუნქციიდან) 
 changeCalendar() {

  if (this.appComponent.RemoveFrom == true) {
    this.fillTitleAndServicesRemove()
  } else if (this.appComponent.RedoForm == true) {
    this.fillTitleAndServicesRedo()
  }
  if (this.choserOfRemoveServices) {
    this.firstServiceForDropdown = this.globalVariables.url + `/Product/GetReturnProductCompany?authorizationID=${this.globalVariables.authorizationID}&dateTimeFirst=${this.firstdate}&dateTimeLast=${this.lastdate}`;

  }
  else if(this.choserOfRedoServices){
    this.firstServiceForDropdown = this.globalVariables.url + `/Product/GetTurnProductCompany?authorizationID=${this.globalVariables.authorizationID}&dateTimeFirst=${this.firstdate}&dateTimeLast=${this.lastdate}`;

  }

  if (this.firstdate != '' && this.lastdate != '') {
    this.http.get(this.firstServiceForDropdown)
      .subscribe((data: any) => {
        if (data.OperationStatus == 1) {
          this.companyarray = data.Result;
        }
      },
        error => {
          console.log('error')
        },
        () => {
          setTimeout(() => {
            $('#companySelectpicker').selectpicker('refresh');
          })
        })
  }
}


  usedbycompanydropdown() {
    this.mainDate = [];
    this.partynumberarray = []
    this.companycode = $('#companySelectpicker').val();
    if (this.appComponent.RemoveFrom == true) {
      this.secondServiceForDropdown = this.globalVariables.url + `/Product/GetReturnPartNumber?authorizationID=${this.globalVariables.authorizationID}&dateTimeFirst=${this.firstdate}&dateTimeLast=${this.lastdate}&companyCode=${this.companycode}`;

    } else if (this.appComponent.RedoForm == true) {
      this.secondServiceForDropdown = this.globalVariables.url + `/Product/GetReturnProductPartNumber?authorizationID=${this.globalVariables.authorizationID}&dateTimeFirst=${this.firstdate}&dateTimeLast=${this.lastdate}&companyCode=${this.companycode}`;

    }
    this.http.get(this.secondServiceForDropdown)
      .subscribe(
        (data: any) => {
          if (data.OperationStatus == 1) {
            this.partynumberarray = data.Result;
          }
        },
        error => {
          console.log('error')
        },
        () => {
          setTimeout(() => {
            $('#companySelectpicker').selectpicker('refresh');
            $('#partnumberSelectpicker').selectpicker('refresh');
          })
        });
        
  }

  saveturnProducts
  fillTable() {
    this.mainDate = [];
    this.partynumber = $('#partnumberSelectpicker').val();
    if (this.appComponent.RemoveFrom == true) {
      this.fillTableService = this.globalVariables.url + `/Product/GetTurnProduct?authorizationID=${this.globalVariables.authorizationID}&partNumber=${this.partynumber}`;

    } else if (this.appComponent.RedoForm == true) {
      this.fillTableService = this.globalVariables.url + `/Product/GetReturnProduct?partNumber=${this.partynumber}&authorizationID=${this.globalVariables.authorizationID}`;

    }
    this.http.get(this.fillTableService)
      .subscribe(
        (data: any) => {
          if (data.OperationStatus == 1) {
            this.saveturnProducts = data.Result
            for (let obj of data.Result) {
              this.productCode = obj.Code;
              if (this.appComponent.RemoveFrom == true) {
                this.lastService = this.globalVariables.url + `/Product/GetturnProductInfo?productCode=${this.productCode}&partNumber=${this.partynumber}&authorizationID=${this.globalVariables.authorizationID}`;
          
              } else if (this.appComponent.RedoForm == true) {
                this.lastService = this.globalVariables.url + `/Product/GetReturnProduct?partNumber=${this.partynumber}&authorizationID=${this.globalVariables.authorizationID}`
          
              }
              this.http.get(this.lastService)
                .subscribe(
                  (data: any) => {
                    if (data.OperationStatus == 1) {
                      for (let obj of data.Result) {
                        obj.productCode = this.saveturnProducts
                          .filter(o => o.Name == obj.Name)[0].Code
                        // obj.BarCodeQuantity = 5;
                        this.mainDate.push(obj);
                      }
                    }
                  });
            }
          }
        },
        error => {
          console.log('error')
        });
  }

  clearform() {
    //კალენდრის გასუფთავება
    this.firstdateForNgModel = ''
    this.seconddateForNgModel = ''
      this.mainDate = [];
      this.firstdate = '';
      this.lastdate = '';
      this.firstServiceForDropdown = ''
      this.secondServiceForDropdown = ''
      this.fillTableService = ''
      this.lastService = ''
      this.SaveService = ''
      $('#startDate').val('');
      $('#endDate').val('');
      this.companyarray = [];
      this.partynumberarray = [];
      $('.selectpicker option').remove();
      $('.selectpicker').selectpicker('refresh');
  }

  Refreshinputs() {
    $('table input').val('');
  }

  save() {
    let datas = []

    for (let index = 0; index < $('#tableReturnProduct tbody tr').length; index++) {
      var thisTR = $(`#tableReturnProduct tbody tr:eq(${index})`),
        quantity = thisTR.find('input').val()

        var quant = this.mainDate.filter(o => o.Name == thisTR.find('td.productName').html())[0].Quantity
      var barcoquant = this.mainDate.filter(o => o.Name == thisTR.find('td.productName').html())[0].BarCodeQuantity
      if (this.appComponent.RemoveFrom == true) {
        if (quant >= quantity && quantity <= barcoquant && quantity != 0) {
          datas.push({
            "ProductCode": this.mainDate.filter(o => o.Name == thisTR.find('td.productName').html())[0].productCode,
            "Count": quantity
          })
      }
      }
      else if(this.appComponent.RedoForm==true) {
        if (quant >= quantity && quantity != 0) {
          datas.push({
            "ProductCode": this.mainDate.filter(o => o.Name == thisTR.find('td.productName').html())[0].productID,
            "Count": quantity
          })
        }
      }
       
    }
    if (datas.length != $('#tableReturnProduct tbody tr').length) {
      alert('Wrong Quantity!!')
    } else {
     
      if (this.appComponent.RemoveFrom == true) {
        
        this.http.post(this.globalVariables.url + `/Product/TurnProductList?companyCode=${this.companycode}&partNumber=${this.partynumber}&status=${this.status}&authorizationID=${this.globalVariables.authorizationID}`,datas)
          .subscribe((data: any) => {
            if (data.OperationStatus == 1) {
              this.appComponent.updateTable = true
              this.appComponent.showMainButtons = true
              this.appComponent.activeField = 'dashboard'
              this.appComponent.innerTitle = ''
              $('#turnReturnModal').modal('hide');
              this.clearform()
          }
        })

      } else if (this.appComponent.RedoForm == true) {
        this.http.post(this.globalVariables.url + `/Product/ReturnProductList?companyCode=${this.companycode}&partNumber=${this.partynumber}&status=${this.status}&authorizationID=${this.companycode}&partNumber=${this.partynumber}&status=${this.status}&authorizationID=${this.globalVariables.authorizationID}`,datas)
        .subscribe((data: any) => {
          if (data.OperationStatus == 1) {
            this.appComponent.updateTable = true
            this.appComponent.showMainButtons = true
            this.appComponent.activeField = 'dashboard'
            this.appComponent.innerTitle = ''
            $('#turnReturnModal').modal('hide');
            this.clearform()
        }
      })

    }
    }
    console.log(datas)
    return
  }

  choserOfRedoServices
  choserOfRemoveServices
  fillTitleAndServicesRemove() {
    this.choserOfRemoveServices = true
    this.choserOfRedoServices = false
  }

  fillTitleAndServicesRedo() {
    this.choserOfRedoServices = true
    this.choserOfRemoveServices = false
  }
 
  firstdateForNgModel
  seconddateForNgModel
//გამოიძახება (ერთ-ერთი)ფორმის გახსნისას კითხულობს თარიღებს კალენდრიდან
  addEvent(ev) {
    if (ev.targetElement.id == "startDate") {
      this.firstdate = ev.targetElement.value;
      this.partynumberarray = []
      this.companyarray = []
      $('.selectpicker option').remove();
      $('.selectpicker').selectpicker('refresh');
    }
    else if (ev.targetElement.id == "endDate") {
      this.lastdate = ev.targetElement.value;
      this.partynumberarray = []
      this.companyarray = []
      $('.selectpicker option').remove();
      $('.selectpicker').selectpicker('refresh');
    }
    if (this.firstdate!=''&&this.lastdate!='') {
      this.changeCalendar()
    }
  }
}

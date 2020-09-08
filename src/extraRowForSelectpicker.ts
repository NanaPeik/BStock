import { HttpClient } from '@angular/common/http';
import { GlobalVariables } from './globalVariables';

declare var $: any;

export class extraRowForSelectpicker {

    constructor(private http: HttpClient, private glovalVariables: GlobalVariables) {
    }

    newRowForDropdown(selectpickerID) {
        var that = this
        function addNewRow() {
            $('#' + selectpickerID).selectpicker('refresh')
            setTimeout(() => {

                if (selectpickerID == undefined || selectpickerID == '') {
                    console.log('ფუნცქციას ID არ გადაეცა')
                    return
                }

                $(`option.${selectpickerID}_addItem`).remove()


                $('#' + selectpickerID)
                    .append(`<option class="${selectpickerID}_addItem"></option>`)
                    .selectpicker('refresh')


                var content = `
                <input type='text' class='form-control'
                    onKeyDown='event.stopPropagation();'
                    onClick='event.stopPropagation()'
                    placeholder='დამატება'>
                <span style='margin-right: -5px; margin-top: 6px;'
                class='material-icons addnewicon'>add</span>
            `

                //
                $(`ul .${selectpickerID}_addItem`).append(content)
                    .attr('onClick', 'event.stopPropagation()')
                    .css({
                        'background': 'transparent',
                        'display': 'flex'
                    })

                //float
                $(`ul .${selectpickerID}_addItem`).parent('li').css({
                    "position": "fixed",
                    "bottom": "0px",
                    "width": "100%"
                })
                $(`.${selectpickerID}_addItem`).parent('li').parent('ul').css('padding-bottom', '35px')

                //მოვლენა "+" ღილაკზე
                $(`ul .${selectpickerID}_addItem span`).click(function () {
                    let inputValue = $(`ul .${selectpickerID}_addItem input`).val();

                    if (inputValue == '') {
                        alert('ველი ცარიელია')
                        return
                    }

                    let status = true
                    for (let index = 0; index < $('#' + selectpickerID).find('option').length; index++) {
                        if ($('#' + selectpickerID).find('option').eq(index).html() == inputValue) {
                            status = false;
                            break
                        }
                    }

                    if (status) {
                        if (selectpickerID == "supplier") {
                            $('#addNewSupplier_modal').modal('show')
                            $('#newSupplierCode').val('').attr('name', inputValue)//name_ში ვინახავ დასახელებას, რომელიც dropdown_ის input ველში შეიყვანა მომხმარებელმა
                            return
                        }

                        $(`#${selectpickerID} .${selectpickerID}_addItem`).remove()
                        if (selectpickerID == "brandSelectForHand" || selectpickerID.includes('brand')) {
                            /*
                            alert('დასაერთებელია სერვისი... ასევე გასავლელია სერვისისთვის brandCode_ს გადაცემის საკითხი')
                            $('#' + selectpickerID).append('<option value="' + ($('#' + selectpickerID).find('option').length + 1) + '" selected>' + inputValue + '</option>').selectpicker('refresh')
                            */

                            that.setNewGroup(selectpickerID, inputValue, '*')
                        }
                        else {
                            $('#' + selectpickerID).append('<option value="" selected>' + inputValue + '</option>').selectpicker('refresh')
                        }


                        if (selectpickerID == 'productSelectForHand') {
                            $('#productUserCode').val('').attr('disabled', false)
                        }

                        //
                        //addNewRow()
                    }
                    else {
                        alert('ასეთი მონაცემი უკვე არსებობს.')
                    }
                })
            })
        }

        addNewRow()
    }


    setNewGroup(dropdownID, groupName, groupCode) {
        this.http.get(this.glovalVariables.url + '/Product/SetGroup?groupName=' + groupName + '&groupCode=' + groupCode + '&authorizationId=' + this.glovalVariables.authorizationID)
            .subscribe((data: any) => {
                if (data.Operationstatus == 1) {
                    $('#' + dropdownID).append('<option value="' + data.Result.Message + '" selected>' + groupName + '</option>').selectpicker('refresh')
                    this.newRowForDropdown(dropdownID)
                }
            })
    }
}
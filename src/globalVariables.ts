export class GlobalVariables {
    // url = "http://tejmur-001-site5.ctempurl.com/api";
    // authorizationID = "A4D142B6825DF58E638E5D4845B"
    // stockCode = "002"
    // mainUserCode = "18"

    // showButtonsList = ['import', 'export']
    // // activeTabID = '#mainSupplies'
    // activeTabID = ''

    windowLocationOrigin = window.location.origin
    url = (this.windowLocationOrigin == "http://localhost:4200") ? "https://blive.com.ge/BStock/WebApi/api" : this.windowLocationOrigin + "/BStock/WebApi/api";
    // url = this.windowLocationOrigin + "/BStock/WebApi";
    authorizationID = ""
    stockCode = ""
    mainUserCode = ""

    showButtonsList = []
    activeTabID = ""

    userName = ""

    visualizationForUser1 = true
}
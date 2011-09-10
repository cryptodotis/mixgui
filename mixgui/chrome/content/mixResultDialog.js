function init(){
    // set main and detail result messages, if any.
    // they are given by the parameter given to the window.
    var oInputPar = window.arguments[0];
    if(oInputPar == null){
	// no parameters have been passed.
	return;
    }
    var sMainText = oInputPar.mainText;
    var sDetailText = oInputPar.detailText;
    var lblMain = document.getElementById("lblMainResultText");
    lblMain.value = sMainText;
    // set the details content.
    document.getElementById("txtMsg").value = sDetailText;
}

function btnDetailsHandler(){
    document.getElementById("txtMsg").hidden = !document.getElementById("txtMsg").hidden;
}
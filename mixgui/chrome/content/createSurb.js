function initSurbCount(){
    document.getElementById("txtSurbNr").value = "1";
}

function acceptHandler(){
    var sAddress;
    sAddress = getEmail();
    // read the pwd.
    //    var sPwd = getPassprhase();
    var sPwd = getPwd();
    // Surb path.
    var sSurbPath = document.getElementById("txtSurbPath").value;
    // Number of surbs to be created.
    var sSurbCount = document.getElementById("txtSurbNr").value;

    // validate user inputs.
    if(!sPwd){
	alert("Insert your secret key passphrase to create the surb.");
	return false;
    }
    if(!validateEmail(sAddress)){
	alert("Insert the Reply To address for the surb.");
	return false;
    }
    if(!sSurbCount){
	alert("Insert how many surbs need to be created.");
	return false;
    }
    if(!sSurbPath){
	alert("Insert file path where surbs will be saved to.");
	return false;
    }

    // build params.
    var asParameters = buildMixSurbParams(sAddress,sSurbCount);
    // adding out parameter so that surbs will be written to choosen file.
    asParameters[asParameters.length] = ("-o " + sSurbPath);
    
    var oResult = runMixminion(asParameters, sPwd, []);
    if(oResult.status != 0){
	// alert window with error details
	// directly accessible by the user if he wants.
	window.openDialog("chrome://gui/content/mixResultDialog.xul", "",
			  "chrome,centerscreen,modal",
			  {mainText: "Surb creation failed.\nSee logs for details.", detailText: oResult.message});
    }else{
	window.openDialog("chrome://gui/content/mixResultDialog.xul", "",
			  "chrome,centerscreen,modal",
			  {mainText: "Surbs succesfully created.\nSee logs for details.", detailText: oResult.message});
    }
}

function btnSurbPathHandler(){
    SelectFile("Select mixminion path", "txtSurbPath", true);
}

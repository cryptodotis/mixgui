

// function init(){
//         alert("address init!");

//     //    document.getElementById("txtUserAddress").value = window.arguments[0].in;
// }
/*
  Returns the email address given by the user.
*/
function enableCustomAddress(bValue){
    document.getElementById("txtCustomAddress").disabled = !bValue;
}

function acceptHandler(){
    
    var sAddress = null;
    // read the pwd.
    var sPwd = null; 

    var bAttachSurb = document.getElementById("ckbSurb").checked;
    if(bAttachSurb){
	// get data for surb generation.
	sAddress = getEmail();
	if(!validateEmail(sAddress)){
	    alert("Insert the Reply To address for the surb.");
	    return false;
	}
	
	sPwd = getPwd();
	// validate user inputs.
	if(!sPwd){
	    alert("Insert your secret key passphrase to create the surb.");
	    return false;
	}
    } else{
	
    }
    var bSendNow = document.getElementById("rbSend").selected;
    // write user input to return variable.
    if(window.arguments[0] != null){
	window.arguments[0].out = {bAttachSurb:bAttachSurb, sAddress:sAddress, sPassword:sPwd, bSendNow:bSendNow};
	return true;
    }
}

/*
  Sets the selected path as "surb path" textbox content
*/
function btnSelectSurb(){
    sSurbPath =  openFilePicker();
    // set texbox value to the selected path.
    var txtPath = document.getElementById("txtSurbPath");
    document.getElementById("txtSurbPath").value =  sSurbPath;	
}

/*
  Handler for click on surb checkbox.
  It enables/disables surb options according to the 
  checkbox value.
*/
function ckbSurbClickHandler(){
    var bChecked = document.getElementById("ckbSurb").checked;
    // click affects the value after this handler, so when the flag is read 
    // as false controls have to be enabled.
    disableSurbData(bChecked);
}
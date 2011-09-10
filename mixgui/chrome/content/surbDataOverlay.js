window.addEventListener("load", function() { init(); }, false);

function init(){

    var asEmails = getAllProfilesEmail();
    // Add profiles email addresses to the addresses menulist.
    var oMenuList = document.getElementById("addList");

    const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
    var oItem;
    for(iCounter in asEmails){

	oItem = document.createElementNS(XUL_NS, "menuitem"); // create a new XUL menuitem
	oItem.setAttribute("value", "addr"+iCounter);
	oItem.setAttribute("label", asEmails[iCounter]);
	oMenuList.appendChild(oItem);
    }
}

/*
  returns the passphrase textbox content.
*/
function getPassprhase(){
    // read the pwd.
    return document.getElementById("txtPwd").value;
}

/*
  returns the email address menulist current value.
*/
function getEmail(){
    var oMenuList = document.getElementById("txtReplyToAddress");
    
    // return the current menulist label.
    return oMenuList.label;
}


/*
  Disables input items in the overlay.
  bDisabled: the disable value to be set.
*/
function disableSurbData(bDisabled){
    document.getElementById("txtReplyToAddress").disabled = bDisabled;
    //    document.getElementById("txtPwd").disabled = bDisabled;    
}



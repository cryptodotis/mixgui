var sSurbFilePath;

window.addEventListener("load", function() { onLoadHandler(); }, false);

window.addEventListener("unload", function() { onUnLoadHandler(); }, false);

function onLoadHandler(){

    var btnSend = document.getElementById("button-send");
    var btnMixSend = document.getElementById("btnMixSend");
    var miAttachedReply = document.getElementById("miAttachedReply");
    var miInspectSurb = document.getElementById("miInspectSurb");
    //    miAttachedReply.collapsed = true;

    for(iCounter in window.arguments){
	var oCurrPar = window.arguments[iCounter];
	if(oCurrPar != null){    
// 	    if(oCurrPar.asReplyBlock != null){
// 		// We found a reply block, disable normal and mix send buttons. 
// 		// Just mix reply will be available.
// 		btnSend.disabled = true;
// 		btnMixSend.disabled = true;
// 		// TODO: sanitize SURB.
// 		var sSurbsText = "";
		
// 		for(iSurb in oCurrPar.asReplyBlock){
// 		    var sSurbBegin = "-----BEGIN TYPE III REPLY BLOCK-----";
// 		    var sSurbEnd = "-----END TYPE III REPLY BLOCK-----";
		    
// 		    var sBeginPattern = new RegExp("- " + sSurbBegin);
// 		    var sEndPattern = new RegExp("- " + sSurbEnd);
// 		    var sSurb = oCurrPar.asReplyBlock[iSurb];
// 		    sSurb = sSurb.replace(sBeginPattern, sSurbBegin);
// 		    sSurb = sSurb.replace(sEndPattern, sSurbEnd);

		
// 		    sSurbsText +=sSurb + "\n";
// 		}
// 		sSurbFilePath = getTempFilePath(sSurbsText);
		
// 		break;
// 	    }
	    
	    if(oCurrPar.originalMsgURI != null){
		alert("param check: " + oCurrPar.originalMsgURI);
		// look for an attacched surb in the original message.
		const gMessenger = Components.classes["@mozilla.org/messenger;1"].createInstance(Components.interfaces.nsIMessenger);		
		var msgHdr = gMessenger.messageServiceFromURI(oCurrPar.originalMsgURI).messageURIToMsgHdr(oCurrPar.originalMsgURI);
		
		var sBody = getMessageBodyFromHeader(msgHdr);
		// check 
		var bSurbAttached = containsSurb( sBody);
		if(!bSurbAttached){	
		    // the text does not contain any type 3 anonymous message.
		    // do nothing.
		    miAttachedReply.setAttribute('disabled', 'true');
		    miInspectSurb.setAttribute('disabled', 'true');

		}else{
		    // disable send buttons.
		    // TODO: locally save surbs.
		    var asSurb = extractReplyBlock(sBody);
		    sSurbFilePath = surbsToGlobalFile(asSurb);
		    //  		    btnSend.disabled = true;
		    miAttachedReply.setAttribute('disabled', 'false');
		    miInspectSurb.setAttribute('disabled', 'false');
		    //		    btnMixSend.disabled = true;
		}	       
	    }
	    
	}
    }
}


function onUnLoadHandler(){
    if(sSurbFilePath){
	removeFile(sSurbFilePath);
    }
}

function getMessageBodyFromHeader(aMessageHeader){
		    var oMessenger = Components.classes["@mozilla.org/messenger;1"]
			.createInstance(Components.interfaces.nsIMessenger);
		    var listener = Components.classes["@mozilla.org/network/sync-stream-listener;1"]
			.createInstance(Components.interfaces.nsISyncStreamListener);
		    var inputStream = 
			Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance().QueryInterface(Components.interfaces.nsIScriptableInputStream);
		    inputStream.init(listener);

		    var uri = aMessageHeader.folder.getUriForMsg(aMessageHeader);
		    
		    var oMsgService = oMessenger.messageServiceFromURI(uri);
		    oMsgService.streamMessage(uri, listener, null, null, false, null);

		    var sBody = "";
		    inputStream.available();
		    while (inputStream.available()) {
			sBody = sBody + inputStream.read(512);
		    }
		    //		    alert(sBody);
		    
		    // Not working.
		    // var folder = aMessageHeader.folder;
// 		    var sBody;
// 		    try{
// 			sBody = folder.getMsgTextFromStream(listener.inputStream,
// 							    aMessageHeader.Charset,
// 							    65536,
// 							    32768,
// 							    false,
// 							    true,
// 							    { });
// 		    }
// 		    catch(oEx){
// 			alert("Error " + oEx);
// 		    }
		    
		    return sBody;
		}

function btnSelectSurbHandler(){

    const nsIFilePicker = Components.interfaces.nsIFilePicker;
    
    var fp = Components.classes["@mozilla.org/filepicker;1"]
	.createInstance(nsIFilePicker);
    fp.init(window, "Select a SURB file", nsIFilePicker.modeOpen);
    fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText);

    var rv = fp.show();
    if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
	var file = fp.file;
	// Get the path as string. Note that you usually won't 
	// need to work with the string paths.
	var sSurbPath = fp.file.path;
	// work with returned nsILocalFile...
	// TODO: this should refere to a function in a util file, 
	// se how to import an external file.
	window.document.getElementById("txtSurbPath").value = sSurbPath;
    }
}


/*
  Returns the first invalid e-mail address in its input arrays.
  asTos: array of strings containinig TO: addresses.
  asCcns: array of strings containinig CC: addresses.
  asBccs: array of strings containinig BCC: addresses.
*/
function validateAddresses(asTos, asCcs, asBccs){  
    var bAddrOk = false;
    for(iAddrCount in asTos){
	if(!validateEmail(asTos[iAddrCount])){
	    // If email address is not a valid one return it.    
	    return asTos[iAddrCount];
	}    
    }
    for(iAddrCount in asCcs){
	if(!validateEmail(asCcs[iAddrCount])){
	    // If email address is not a valid one return it.    
	    return asCcs[iAddrCount];
	}    
    }
    for(iAddrCount in asBccs){
	if(!validateEmail(asBccs[iAddrCount])){
	    // If email address is not a valid one return it.    
	    return asBccs[iAddrCount];
	}    
    }
    if(bAddrOk == false){
	// No address found, return "";
	return "";
    }
    // If everything was ok, return null.
    return null;  
} 

/*
  Looks for a surb in the source msg (assuming the current message is
  a reply to it) and writes the surb to a file. File path is stored
  into the global string sSurbFilePath and returned to the caller.
*/
function extractSurbToFile(){
    for(iCounter in window.arguments){
	var oCurrPar = window.arguments[iCounter];
	if(oCurrPar != null){    
	    if(oCurrPar.originalMsgURI != null){
		// look for an attacched surb in the original message.
		const gMessenger = Components.classes["@mozilla.org/messenger;1"].createInstance(Components.interfaces.nsIMessenger);
		var msgHdr = gMessenger.messageServiceFromURI(oCurrPar.originalMsgURI).messageURIToMsgHdr(oCurrPar.originalMsgURI);
		
		var sBody = getMessageBodyFromHeader(msgHdr);
		// check 
		var bSurbAttached = containsSurb( sBody);
		if(!bSurbAttached){	
		    // the text does not contain any type 3 anonymous message.
		    // do nothing.
		    // miAttachedReply.setAttribute('disabled', 'true');
		    return;

		}else{
		    // disable send buttons.
		    // TODO: locally save surbs.
		    var asSurb = extractReplyBlock(sBody);
		    sSurbFilePath = surbsToGlobalFile(asSurb);
		    return sSurbFilePath;
		    //  		    btnSend.disabled = true;
		    // miAttachedReply.setAttribute('disabled', 'false');
		    //		    btnMixSend.disabled = true;
		}	       
	    }
	}
    }

}
/*
  Handler for the "Inspect Surb menu item."
*/
function btnInspect(){
    extractSurbToFile();
    if(sSurbFilePath != null){
	var oSurbParam = {surb:sSurbFilePath};
	window.openDialog("chrome://gui/content/inspectSurb.xul", "Mixminion Surb inspection", 
			  "modal, toolbar,location=yes, menubar=no,top=100, left=100px",
			  oSurbParam);
    }else{
	alert("No SURB found.");
	var miInspectSurb = document.getElementById("miInspectSurb");
	miInspectSurb.setAttribute('disabled', 'true');	
    }
}

/*
  bAttachedSurb: if true an attached surb  (if any is in the message to be replied) is used to send the message,
                 if false a user surb file is needed.
*/
function btnMixReply(bAttachedSurb){
    var oEditor = window.gMsgCompose.editor;
    // for html:
    // oEditor.outputToString('text/html', oEditor.eNone);
    // convert the body in plain text format.
    var sBody = oEditor.outputToString('text/plain', 4);
    var sSubject = document.getElementById("msgSubject").value;
    
    var sSurbPath;
    
    // looking for a surb to be used to send the current message.
    if(bAttachedSurb){
	if(sSurbFilePath == null){
	    // try to get a surb from the msg we are replying to.
	    extractSurbToFile();
	}
	if(sSurbFilePath != null){
	    sSurbPath = sSurbFilePath;
	}else{
	    return;
	}
    }
    else{
	sSurbPath = window.document.getElementById("txtSurbPath").value;
	if(!sSurbPath ){
	    // No surb found.
	    alert("Please select a valid surb file path");
	    return;
	}
    }

    var asReplyBLocks;
    var oAddressParam = {in: null, out:null};
    window.openDialog("chrome://gui/content/sendOptions.xul", "Mixminion send options", 
		      "modal, toolbar,location=yes, menubar=no,top=100, left=100px",oAddressParam);

    if(oAddressParam.out == null){
	// No info for sending the message, do nothing. It is because the user 
	// closed send option dialog without his ok.
	return;
    }
    if(oAddressParam.out.bAttachSurb == true){
	// a surb needs to be attached to each message.
	// create a surb for each message to be sent.
	// number of receivers.
	var sRecCount = 1;
	// var oAddressParam = {in: null, out:null};
	//	    oAddressParam.in = getCurrProfileEmail();    
	// 	window.openDialog("chrome://gui/content/sendOptions.xul", "Mixminion send options", 
	// 			  "modal, toolbar,location=yes, menubar=no,top=100, left=100px,width=100cm",oAddressParam);
	
	// generate needed surbs.
	asReplyBLocks = generateSurb(sRecCount, oAddressParam.out.sAddress, oAddressParam.out.sPassword);
	if(asReplyBLocks == null){
	    window.openDialog("chrome://gui/content/mixResultDialog.xul", "",
			      "chrome,centerscreen,modal",
			      {mainText: "Surb generation failed.\nSee logs for details.", detailText: "Surb generation failed.\nSee logs for details."});
	    return;
	}
	
	if(asReplyBLocks.length != sRecCount){
	    alert(asReplyBLocks.length + "!=" + sRecCount);
	    return;
	}
    }

    var sAddrCount = 1;
    if(asReplyBLocks != null && sAddrCount < asReplyBLocks.length){
	// Attacching a surb, if any is available.
	sBody += "\n" + asReplyBLocks[sAddrCount];
    }

    var asParams = buildMixReplyParams(sSurbPath, sSubject, sBody, oAddressParam.out.bSendNow);
    if(asParams != null){
    
	var oResult = runMixminion(asParams,null,null);
	var sOutput = oResult.message;
	if(oResult.status != 0 || oResult.message.match("Error while delivering packets")){
	    // alert window with error details
	    // directly accessible by the user if he wants.
	    window.openDialog("chrome://gui/content/mixResultDialog.xul", "",
			      "chrome,centerscreen,modal",
			      {mainText: "Reply send failed.\nSee logs for details.", detailText: oResult.message});
	}else{
	    window.openDialog("chrome://gui/content/mixResultDialog.xul", "",
			      "chrome,centerscreen,modal",
			      {mainText: "Reply succesfully sent on mixminion.\nSee logs for details.", detailText: oResult.message});
	}
    }
    window.close();
}

/*
  Sends the current message over mixminion network.
  bEnqueu: if true the message is not actually send but
  just put into the mixminion output queue.
*/
function btnMixSend(bEnqueue){
     
    var sMixPath = getMixPathToPrefs();
    
    getMixPathToPrefs();
    // Getting how many rows are in addresses list.    
    // https://developer.mozilla.org/en/Extensions/Thunderbird/HowTos/Common_Thunderbird_Use_Cases/Compose_New_Message
    
    var iRowsCount = document.getElementById("addressingWidget").getRowCount();
    
    
    // fields in the composer object. (?)
    var msgCompFields = gMsgCompose.compFields;
    Recipients2CompFields(msgCompFields);
    // Done, we finally have "to" recipients :-)
    var sAddresses = MixStripEmail(msgCompFields.to);

    /*
      From:
      http://groups.google.com/group/mozilla.dev.extensions/browse_thread/thread/14357b7c8d84544c]

    */
    // Getting the editor for the current compose window.
    var oEditor = window.gMsgCompose.editor;
    // for html:
    // oEditor.outputToString('text/html', oEditor.eNone);
    // convert the body in plain text format.
    var sBody = oEditor.outputToString('text/plain', 4);

    var sSubject = document.getElementById("msgSubject").value; 

    var asAddrs = sAddresses.split(",");
    var bValid = false;
    for(sAddrCount in asAddrs){
	bValid |= validateEmail(asAddrs[sAddrCount]);
    }
    if(!bValid){
	alert("No valid destination address found. No message will be sent.");
	return;
    }
    // Surbs to be attacched to messages to be sent.
    var asReplyBLocks;
    var oAddressParam = {in: null, out:null};
    window.openDialog("chrome://gui/content/sendOptions.xul", "Mixminion send options", 
		      "modal, toolbar,location=yes, menubar=no,top=100, left=100px",oAddressParam);

    if(oAddressParam == null){
	return;
    }
    if(oAddressParam.out == null){
	return;
    }
    
    if(oAddressParam.out.bAttachSurb){   

	// a surb needs to be attached to each message.
	// create a surb for each message to be sent.
	// number of receivers.
	var sRecCount = asAddrs.length;

	// generate needed surbs.
	asReplyBLocks = generateSurb(sRecCount, oAddressParam.out.sAddress, oAddressParam.out.sPassword);
	if(asReplyBLocks == null){
	    window.openDialog("chrome://gui/content/mixResultDialog.xul", "",
			      "chrome,centerscreen,modal",
			      {mainText: "Surb generation failed.\nSee logs for details.", detailText: oResult.message});
	    return;
	}	
	if(asReplyBLocks.length != sRecCount){
	    alert(asReplyBLocks.length + "!=" + sRecCount);
	    return;
	}
    }

//     // TODO: use nsiMsgIdentity or nsiMsgAccountManager to select an
//     // address for the surb.
//     // https://developer.mozilla.org/en/Thunderbird/Account_examples
//     var oIdentity = Components.classes["@mozilla.org/messenger/identity;1"].createInstance(Components.interfaces.nsIMsgIdentity);
//     alert("from: " + oIdentity.email);
//     oIdentity = gMsgIdentityElement;
//     alert("from: " + oIdentity.email);

//     var acctMgr = Components.classes["@mozilla.org/messenger/account-manager;1"]  
// 	.getService(Components.interfaces.nsIMsgAccountManager);  
//     var accounts = acctMgr.accounts;  
//     for (var i = 0; i < accounts.Count(); i++) {  
// 	var account = accounts.QueryElementAt(i, Components.interfaces.nsIMsgAccount);  
// 	for(var iIdentCount =0; iIdentCount < account.identities; iIdentCount++)
// 	    {
// 		alert(account.identities[iIdentCount]);  
// 	    }
//     }
//     var sFrom = oIdentity.email;
//     alert("from: " + sFrom);

    // array of single addresses.
    for(sAddrCount in asAddrs){
	var bValidAddress = validateEmail(asAddrs[sAddrCount]);
	if(! bValidAddress){
	    alert(asAddrs[sAddrCount] + " is not a valid address, no message will be sent to it.");
	    continue;
	}
	if(asReplyBLocks != null && sAddrCount < asReplyBLocks.length){
	    // Attacching a surb, if any is available.
	    sBody += "\n" + asReplyBLocks[sAddrCount];
	}
	var asParameters = null;
	asParameters = buildMixParams(asAddrs[sAddrCount], sSubject, sBody, oAddressParam.out.bSendNow);
	
	var oResult = runMixminion(asParameters,null,null);
	// The product has the side effect to cast the string to a number.
	var iMsgCounter = sAddrCount*1 + 1;
	var sMsgCounter = iMsgCounter + " of " + asAddrs.length;
	if(oResult.status != 0 || oResult.message.match("Error while delivering packets")){
	    // alert window with error details
	    // directly accessible by the user if he wants.
	    window.openDialog("chrome://gui/content/mixResultDialog.xul", "",
			      "chrome,centerscreen,modal",
			      {mainText: "Message " + sMsgCounter + " could not be sent.\nSee logs for details.", detailText: oResult.message});

	}else{
	    window.openDialog("chrome://gui/content/mixResultDialog.xul", "",
			      "chrome,centerscreen,modal",
			      {mainText: "Message " + sMsgCounter + " succesfully sent on mixminion.\nSee logs for details.", detailText: oResult.message});
	}	
    }
    // Close the compose window.
    window.close();

     /*
       Code quoted from function enigEncryptMsg(msgSendType) 
       in enigmailMsgCompose.js
     */    
}

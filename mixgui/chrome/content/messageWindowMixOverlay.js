/*
  Global variable for temporary files reference. It may be used to
  remove tmp files from file system.
*/
var goTmpFile;

var sSurbFilePath;

window.addEventListener("load", function() { onLoadHandler(); }, false);
window.addEventListener("unload", function() { closeHandler(); }, false);


function closeHandler(){
    if(goTmpFile){
	removeFile(goTmpFile.path);
    }
}

function onLoadHandler(){
//     alert("onLoadHandler");
    var messagepane = document.getElementById("messagepane"); // mail
    if(messagepane)
    {
	messagepane.addEventListener("load", onMsgLoad, true);
    }
}

function initDecodeBtn(){

    var msgFrame = MixGetFrame(window, "messagepane");
    var sBodyElement = msgFrame.document.getElementsByTagName("body")[0];

    var sMsgText = sBodyElement.textContent;
    var bAnon = isAnonCryptMessage( sMsgText);
    var btnDecode = document.getElementById("btnMixDecode");
    var miDecode = document.getElementById("miDecode");
    
    if(!bAnon){	
	// the text does not contain any type 3 anonymous message.
	// disable decode button.
	btnDecode.disabled = true;
	miDecode.setAttribute("disabled",'true');
// 	alert(sReplyText);
    }else{
	// enable decode button.
	btnDecode.disabled = false;
	miDecode.setAttribute("disabled",'false');
    }

}

function initReplyBtn(){

    var msgFrame = MixGetFrame(window, "messagepane");
    var sBodyElement = msgFrame.document.getElementsByTagName("body")[0];

    var sSurbText = getDeepText(sBodyElement, "-----BEGIN TYPE III REPLY BLOCK-----");
    var bSurbAttached = containsSurb( sSurbText);
    var btnSurb = document.getElementById("btnMixReply");
    var miInspect = document.getElementById("miInspect");
    // disable reply, not implemented yet.
    if(!bSurbAttached){	
	// the text does not contain any type 3 anonymous message.
	// disable decode button.
	btnSurb.disabled = true;
	miInspect.setAttribute("disabled",'true');
// 	alert(sReplyText);
    }else{
	// enable decode button.
	btnSurb.disabled = false;
	miInspect.setAttribute("disabled",'false');
    }
}

function onMsgLoad(){
    //     alert("onMsgLoad");
    //    var srcMsgURI = GetLoadedMessage();
//     alert(srcMsgURI);
//     // get message content
//     var sReplyText = getMsgtext();

    initDecodeBtn();
    initReplyBtn();
}

function btnInspectHandler(){

    var msgFrame = MixGetFrame(window, "messagepane");
    var sBodyElement = msgFrame.document.getElementsByTagName("body")[0];

    var sSurbText = getDeepText(sBodyElement, "-----BEGIN TYPE III REPLY BLOCK-----");

    var asSurb = extractReplyBlock(sSurbText);

    sSurbFilePath = surbsToGlobalFile(asSurb);
    if(sSurbFilePath != null){
	var oSurbParam = {surb:sSurbFilePath};
	var oPrefs = window.openDialog("chrome://gui/content/inspectSurb.xul", "Mixminion Surb inspection", 
				       "modal, toolbar,location=yes, menubar=no,top=100, left=100px,width=100cm",oSurbParam);
	return;
    }
    alert("Error: unable to read surbs");

}

function btnMixReplyHandler(){
    var msgFrame = MixGetFrame(window, "messagepane");
    var sBodyElement = msgFrame.document.getElementsByTagName("body")[0];

    var sSurbText = getDeepText(sBodyElement, "-----BEGIN TYPE III REPLY BLOCK-----");

    var asSurb = extractReplyBlock(sSurbText);
    // TODO: extract the reply block.
    // verify it is a good one.
    var bValidSurb = true;
    if(bValidSurb == true){
	//	window.openDialog("chrome://messenger/content/messengercompose/messengercompose.xul","","", {type: "anonreply", asReplyBlock: asSurb});
	var srcMsgURI = GetLoadedMessage();
	var msgHdr = messenger.messageServiceFromURI(srcMsgURI).messageURIToMsgHdr(srcMsgURI);
	
	// TODO: add header with surb.
	// https://developer.mozilla.org/en/Extensions/Thunderbird/HowTos/Common_Thunderbird_Use_Cases/Compose_New_Message#Open_New_Message_Window
	// https://developer.mozilla.org/en/XPCOM_Interface_Reference/NsIMsgCompFields
	// TODO:
	ComposeMessage(Components.interfaces.nsIMsgCompType.ReplyToSender, Components.interfaces.nsIMsgCompFormat.Default, msgHdr.folder, [srcMsgURI]);


    }

    //    alert("Reply using attached surb not implemented yet.");
}

function btnMixDecodeHandler(){
    
    var msgFrame = MixGetFrame(window, "messagepane");
    var sBodyElement = msgFrame.document.getElementsByTagName("body")[0];

    var sReplyText = getDeepText(sBodyElement, "-----BEGIN TYPE III ANONYMOUS MESSAGE-----");
    
    if(!sReplyText){
	// the text does not contain any type 3 anonymous message.
	alert("Message text does not contain any type 3 anonymous message");
	return;
    }
    // getting the whole message to decode multiple replies.
    
    var sMsgText = sBodyElement.textContent;
    goTmpFile = getTempFilePath(sMsgText);
    var sReplyPath = goTmpFile.path;
    var asDecodeParams = buildMixDecodeParams(sReplyPath);
    
    var oPwdParam = {in: null, out:null};
//     window.openDialog("chrome://gui/content/sendOptions.xul", "Mixminion send options", 
// 		      "modal, toolbar,location=yes, menubar=no,top=100, left=100px,width=100cm",oPwdParam);

    window.openDialog("chrome://gui/content/mixPwdInput.xul", "Mixminion decode options", 
		      "modal, toolbar,location=yes, menubar=no,top=100, left=100px,width=100cm",oPwdParam);

    if(oPwdParam != null){
	if(oPwdParam.out != null){
	    
	    var oRun = runMixminion(asDecodeParams, oPwdParam.out.sPassword, []);
	    // TODO: parse error to handle bad pwd case.
	    
	    if(oRun.status !=0 || oRun.error.match("ERROR")){
		// TODO: show a result dialog.
		window.openDialog("chrome://gui/content/mixResultDialog.xul", "",
				  "chrome,centerscreen,modal",
				  {mainText: "Message decode failed.\nSee logs for details.", detailText: oRun.message});
		return;
	    }

	    // set the decoded message as win content.
	    //	    msgFrame.document.getElementsByTagName("body")[0].textContent = oRun.output;

	    // TODO: make the uri creation an internal function,
	    // avoid the use of enigmail functions to improve portability.
	    var enigmailSvc = GetEnigmailSvc();

	    var oMsg = GetLoadedMessage();
	    var uri = enigmailSvc.createMessageURI(GetLoadedMessage(),
						   "message/rfc822",
						   "",
						   oRun.output,
						   false);
	    messenger.loadURL(msgFrame, uri);
	    ioService = Components.classes["@mozilla.org/network/io-service;1"]
		.getService(Components.interfaces.nsIIOService);
// 	    var oTest = ioService.newFileURI(goTmpFile);
// 	    var oUrl = ioService.newFileURI(goTmpFile).spec;

	    //	    messenger.loadURL(msgFrame, oUrl);
	    // disable decode button.
	    var btnDecode = document.getElementById("btnMixDecode");
	    btnDecode.disabled = true;
	}
    }

//     var oMsgView = window.document.getElementById("messagepane");
//     //    var bodyElement = msgFrame.document.getElementsByTagName("body")[0];
//     var sContent = oMsgView.document.getElementsByTagName("body")[0];
    // check whether it contains a reply
    // if yes decode it
    // set decoded mesage as viewed content
    
    //    alert("Message decode not implemented yet.");

    
}
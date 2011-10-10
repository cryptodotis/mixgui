var gLogFileName = "mixlog.html";

function posIntValidation(oEvent){
    
    // backspace and cancel
    if(oEvent.keyCode == 46 || oEvent.keyCode == 8)
	return true;
    if ((oEvent.charCode >= 48) && (oEvent.charCode <= 57))
	return true;
    return false;
    
}
function validateEmail(elementValue){  
    var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;  
    return emailPattern.test(elementValue);  
} 

/*
  Function quoted from function EnigAddRecipients(mailAddrs) 
  in enigmailCommon.js
*/
function MixAddRecipients(toAddrList, recList) {
  for (var i=0; i<recList.length; i++) {
    toAddrList.push(MixStripEmail(recList[i].replace(/[\",]/g, "")));
  }
}

/*
  Function quoted from function EnigStripEmail(mailAddrs) 
  in enigmailCommon.js
*/
function MixStripEmail(mailAddrs) {

  var qStart, qEnd;
  while ((qStart = mailAddrs.indexOf('"')) != -1) {
     qEnd = mailAddrs.indexOf('"', qStart+1);
     if (qEnd == -1) {
       ERROR_LOG("composeOverlay.js: StripEmail: Unmatched quote in mail address: "+mailAddrs+"\n");
       // TODO: remove the enigmail exception.
       throw ENIG_C.results.NS_ERROR_FAILURE;
     }
     mailAddrs = mailAddrs.substring(0,qStart) + mailAddrs.substring(qEnd+1);
  }

  // Eliminate all whitespace, just to be safe
  mailAddrs = mailAddrs.replace(/\s+/g,"");

  // Extract pure e-mail address list (stripping out angle brackets)
  mailAddrs = mailAddrs.replace(/(^|,)[^,]*<([^>]+)>[^,]*/g,"$1$2");

  return mailAddrs;
}

function isValidFilePath(sSurbPath)
{
    // TODO: Use system char for path separator
    var iIndex = sSurbPath.indexOf('/');
    // checking whether the path begins with file system root.
    if(iIndex == 0){
	return true;
    }
    else{
	return false;
    }
}

/*
  Returns the plaintex from "node" if "findStr" has 
  been found in "node". Empty otherwise. 
  It has been taken from Enigmail.
*/
function getDeepText(node, findStr) {

  if (findStr) {
    if (node.innerHTML.replace(/&nbsp;/g, " ").indexOf(findStr) < 0) {
      // exit immediately if findStr is not found at all
      return "";
    }
  }

  // EnigDumpHTML(node);

  var plainText = MixParseChildNodes(node);
  // Replace non-breaking spaces with plain spaces
  plainText = plainText.replace(/\xA0/g," ");

  if (findStr) {
     if (plainText.indexOf(findStr) < 0) {
        return "";
     }
  }
  return plainText;
}

/*
  Returns: an array of type III reply blocks.
*/
function extractReplyBlock( sInputText){
    //var sExtracted =  extractText(sInputText, "^-----BEGIN TYPE III REPLY BLOCK-----", "^-----END TYPE III REPLY BLOCK-----");
    var sExtracted =  mixExtractText(sInputText, "-----BEGIN TYPE III REPLY BLOCK-----", "-----END TYPE III REPLY BLOCK-----");
    
    return sExtracted;
    
}

/*
  Tests whether the input string contains anonymous crypted messages.
*/
function isAnonCryptMessage( sInputText){
    var sAnonText = extractAnonMessage( sInputText);
    var sCryptPattern = new RegExp("Message-type: encrypted\nDecoding-handle:");
    
    return sCryptPattern.test(sAnonText);
}

/*
  Tests whether the input string contains a surb.
*/
function containsSurb( sInputText){
    var sAnonText = extractReplyBlock( sInputText);
    var sBeginPattern = new RegExp("-----BEGIN TYPE III REPLY BLOCK-----");
    var sEndPattern = new RegExp("-----END TYPE III REPLY BLOCK-----");
    
    return sBeginPattern.test(sAnonText) && sEndPattern.test(sAnonText);
}

/*
  Extracts a type III anonymous messages.
  Returns: an array of type III anonymous messages.
*/
function extractAnonMessage( sInputText){
    var sExtracted =  mixExtractText(sInputText, "-----BEGIN TYPE III ANONYMOUS MESSAGE-----", "-----END TYPE III ANONYMOUS MESSAGE-----");
    
    return sExtracted;
    
}

/*
  Returns an array of strings, containing all the occurrences of text found in 
  sInputText starting from sBegin until sEnd included(if not found until the end 
  of the input).
  Inspired by pemar.
*/
function extractText(sInputText,  sBegin,  sEnd) {
    // array of reply blocks.
    var asReturn = [];
    var iSurbCounter = 0;
    var textRows = sInputText.split("\n");
    var myreplyblock="";
    var collect=false;
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // TODO: these do not work, check it.
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//     var myRegStart = new RegExp(sBegin);
//     var myRegEnd = new RegExp(sEnd);
    for (var count=0; count < textRows.length; count++)
	{
	    if (textRows[count].match("/"+sBegin+"/")) { 
		collect=true;
	    }
	    if (collect)
		{
		    myreplyblock +=textRows[count] + "\n";
		}
	    if (textRows[count].match("/"+sEnd+"/")) { 
		collect=false;
		// Storing the parsed reply block.
		asReturn[iSurbCounter++] = myreplyblock;		
	    }	    
	}
    return asReturn;
}

/*
  Returns an array of strings, containing all the occurrences of text found in 
  sInputText starting from sBegin until sEnd included(if not found until the end 
  of the input).
  Inspired by pemar.
*/
function mixExtractText(sInputText,  sBegin,  sEnd) {
    // array of reply blocks.
    var asReturn = [];
    var iSurbCounter = 0;
    var textRows = sInputText.split("\n");
    var myreplyblock="";
    var collect=false;
    var myRegStart = new RegExp(sBegin);
    var myRegEnd = new RegExp(sEnd);
    for (var count=0; count < textRows.length; count++)
	{
	    if (myRegStart.test(textRows[count])) { 
		collect=true;
	    }
	    if (collect)
		{
		    myreplyblock +=textRows[count] + "\n";
		}
	    if (myRegEnd.test(textRows[count])) { 
		collect=false;
		// Storing the parsed reply block.
		asReturn[iSurbCounter++] = myreplyblock;		
	    }	    
	}
    return asReturn;
}

/*
  Returns the current profile email.
*/
function getCurrProfileEmail(){

    var identityElement = document.getElementById("msgIdentity");

    var gAccountManager = Components.classes["@mozilla.org/messenger/account-manager;1"].getService(Components.interfaces.nsIMsgAccountManager);
    if (identityElement) {
	var idKey = identityElement.value;	    
	var gCurrentIdentity = gAccountManager.getIdentity(idKey);
	return gCurrentIdentity.email;
    }
    return "";
}

/*
  Returns an array with the email (as a string) of each known profile.
*/
function getAllProfilesEmail(){

    var gAccountManager = Components.classes["@mozilla.org/messenger/account-manager;1"].getService(Components.interfaces.nsIMsgAccountManager);
    var asEmails = [];
    var aoIds = gAccountManager.allIdentities;
    var iIdsCounter = aoIds.Count();
    for(var iIdNr = 0; iIdNr< iIdsCounter; iIdNr++){
	var oCurrId = aoIds.QueryElementAt(iIdNr, Components.interfaces.nsIMsgIdentity);
	asEmails[iIdNr] = oCurrId.email;
    }
    
    return asEmails;
}

/*
  Checks whether sPath is a actual file path and whether 
  it leads to an actual file.

  sPath: the path to be checked.
  
  returns: true if the path leads to an existing file, false otherwise.
*/
function pathExists(sPath){
    try{
	var oTmpFile = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);  
	oTmpFile.initWithPath(sPath);  
	if(oTmpFile.exists()){
	    return true;
	}
	else{
	    return false;
	}
    }catch(oEx){
	return false;
    }
}

function showPrefs()
{
	var oReturn = {in: null, out:null};
        var oPrefs = window.openDialog("chrome://gui/content/mixPreferences.xul", "Mixminion Preferences", 
				       "modal, toolbar,location=yes, menubar=no,top=100, left=100px,width=100cm",oReturn);
	return oReturn.out.bValue;
}

function getLogFile(){

    var directoryService =  Components.classes["@mozilla.org/file/directory_service;1"]
	.getService(Components.interfaces.nsIProperties);
    var oLogFile = directoryService.get("ProfD", Components.interfaces.nsIFile);
    oLogFile.append(gLogFileName);

    if (!oLogFile.exists()){
	// if log file does not exist, create one.
	oLogFile.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);  
    }
    return oLogFile;

}

// TODO: add log levels.
function writeLog(sLogMessage){
    var oLogFile = getLogFile();

    var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].  
                            createInstance(Components.interfaces.nsIFileOutputStream);  
     
    // use 0x02 | 0x10 to open file in  append mode.  
    foStream.init(oLogFile, 0x02 | 0x10, 0666, 0);
    
    var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].  
	createInstance(Components.interfaces.nsIConverterOutputStream);  
    converter.init(foStream, "UTF-8", 0, 0);  
    converter.writeString("<p>" + sLogMessage);  
    converter.close(); // this closes foStream  
}

/*
  Returns a temp file path after writing sBody to it.
  sBody (string)
*/
function getTempFilePath(sBody){
    var oTmpFile = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
    oTmpFile.append("msg.tmp");  
    oTmpFile.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);  
    // do whatever you need to the created file  
    
    var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].  
                            createInstance(Components.interfaces.nsIFileOutputStream);  
     
    // use 0x02 | 0x10 to open file for appending.  
    foStream.init(oTmpFile, 0x02 | 0x08 | 0x20, 0666, 0);   
    // write, create, truncate  
    // In a c file operation, we have no need to set file mode with or operation,  
    // directly using "r" or "w" usually.  
    
    // if you are sure there will never ever be any non-ascii text in data you can   
    // also call foStream.writeData directly  
    var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].  
	createInstance(Components.interfaces.nsIConverterOutputStream);  
    converter.init(foStream, "UTF-8", 0, 0);  
    converter.writeString(sBody);  
    converter.close(); // this closes foStream  
    
    return oTmpFile;
}  

function removeFile(sTmpFilePath){
    try{
	var oTmpFile = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);  
	oTmpFile.initWithPath(sTmpFilePath);  
	if(oTmpFile.exists()){
	    oTmpFile.remove(false);
	}
    }catch(oEx){
	// alert(oEx.name + " " + oEx.message);
    }
}

/*
  Opens a file picker

  sText: File picker title.

  sDestinationId: Id of the textbox whose value 
  the selected path will be set to.
*/
function SelectFile(sText, sDestinationId){

    SelectFile(sText, sDestinationId,false);
//     const nsIFilePicker = Components.interfaces.nsIFilePicker;
    
//     var fp = Components.classes["@mozilla.org/filepicker;1"]
// 	.createInstance(nsIFilePicker);
//     fp.init(window, sText, nsIFilePicker.modeOpen);
//     fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText);

//     var rv = fp.show();
//     if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
// 	var file = fp.file;
// 	// Get the path as string. Note that you usually won't 
// 	// need to work with the string paths.
// 	var sFilePath = fp.file.path;
// 	// work with returned nsILocalFile...
// 	// TODO: this should refere to a function in a util file, 
// 	// se how to import an external file.
// 	if(sDestinationId != null){
// 	    var oDomEl = window.document.getElementById(sDestinationId);
// 	    if(oDomEl != null){
// 		window.document.getElementById(sDestinationId).value = sFilePath;
// 	    }
// 	}
//     }
}

/*
  Opens a file picker

  sText: File picker title.

  sDestinationId: Id of the textbox whose value 
  the selected path will be set to.
  
  bSaveMode: if true user can specify new files, if false user can
  select just existing files.
*/
function SelectFile(sText, sDestinationId, bSaveMode){

    const nsIFilePicker = Components.interfaces.nsIFilePicker;
    
    var fp = Components.classes["@mozilla.org/filepicker;1"]
	.createInstance(nsIFilePicker);
    var oOpenMode;
    if(bSaveMode){
	// setting save mode.
	oOpenMode = nsIFilePicker.modeSave;
    }
    else{
	// setting open mode.
	oOpenMode = nsIFilePicker.modeOpen;
    }

    fp.init(window, sText, oOpenMode);
    fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText);
    if(bSaveMode){
	fp.appendFilters(nsIFilePicker.modeSave);
    }

    var rv = fp.show();
    if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
	var file = fp.file;
	// Get the path as string. Note that you usually won't 
	// need to work with the string paths.
	var sFilePath = fp.file.path;
	// work with returned nsILocalFile...
	// TODO: this should refere to a function in a util file, 
	// se how to import an external file.
	if(sDestinationId != null){
	    var oDomEl = window.document.getElementById(sDestinationId);
	    if(oDomEl != null){
		window.document.getElementById(sDestinationId).value = sFilePath;
	    }
	}
    }
}

/*
  Retrieves the path of mixminion executable fom Thunderbird
  preferences.
  Returns: a string containing the path of mixminion.
*/
function getMixPathToPrefs(){

    // Getting extension preferences.
    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                    .getService(Components.interfaces.nsIPrefService).getBranch("extensions.");
    //    prefs.savePrefFile(null);

    // prefs is an nsIPrefBranch.
    // Look in the above section for examples of getting one.
    var sPath = ""; 
    if(prefs.prefHasUserValue("mixminionPath")) {
	// If the preference has bben set
	// getting mixminion path preference.
	sPath = prefs.getCharPref("mixminionPath"); 
    }else{
	// set an empty mixminion path preference.
	setMixPathToPrefs(sPath);
    }
    return sPath;
}

function setMixPathToPrefs(sMixPath){

    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                    .getService(Components.interfaces.nsIPrefService).getBranch("extensions.");

    // prefs is an nsIPrefBranch.
    // Look in the above section for examples of getting one.
    prefs.setCharPref("mixminionPath", sMixPath); // set a pref (accessibility.typeaheadfind)
}

var gLogFileName = "mixlog.html";

function posIntValidation(oEvent){
    
    // backspace and cancel
    if(oEvent.keyCode == 46 || oEvent.keyCode == 8)
	return true;
    if ((oEvent.charCode >= 48) && (oEvent.charCode <= 57))
	return true;
    return false;
    
}
function validateEmail(elementValue){  
    var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;  
    return emailPattern.test(elementValue);  
} 

/*
  Function quoted from function EnigAddRecipients(mailAddrs) 
  in enigmailCommon.js
*/
function MixAddRecipients(toAddrList, recList) {
  for (var i=0; i<recList.length; i++) {
    toAddrList.push(MixStripEmail(recList[i].replace(/[\",]/g, "")));
  }
}

/*
  Function quoted from function EnigStripEmail(mailAddrs) 
  in enigmailCommon.js
*/
function MixStripEmail(mailAddrs) {

  var qStart, qEnd;
  while ((qStart = mailAddrs.indexOf('"')) != -1) {
     qEnd = mailAddrs.indexOf('"', qStart+1);
     if (qEnd == -1) {
       ERROR_LOG("composeOverlay.js: StripEmail: Unmatched quote in mail address: "+mailAddrs+"\n");
       // TODO: remove the enigmail exception.
       throw ENIG_C.results.NS_ERROR_FAILURE;
     }
     mailAddrs = mailAddrs.substring(0,qStart) + mailAddrs.substring(qEnd+1);
  }

  // Eliminate all whitespace, just to be safe
  mailAddrs = mailAddrs.replace(/\s+/g,"");

  // Extract pure e-mail address list (stripping out angle brackets)
  mailAddrs = mailAddrs.replace(/(^|,)[^,]*<([^>]+)>[^,]*/g,"$1$2");

  return mailAddrs;
}

function isValidFilePath(sSurbPath)
{
    // TODO: Use system char for path separator
    var iIndex = sSurbPath.indexOf('/');
    // checking whether the path begins with file system root.
    if(iIndex == 0){
	return true;
    }
    else{
	return false;
    }
}

/*
  Returns the plaintex from "node" if "findStr" has 
  been found in "node". Empty otherwise. 
  It has been taken from Enigmail.
*/
function getDeepText(node, findStr) {

  if (findStr) {
    if (node.innerHTML.replace(/&nbsp;/g, " ").indexOf(findStr) < 0) {
      // exit immediately if findStr is not found at all
      return "";
    }
  }

  // EnigDumpHTML(node);

  var plainText = MixParseChildNodes(node);
  // Replace non-breaking spaces with plain spaces
  plainText = plainText.replace(/\xA0/g," ");

  if (findStr) {
     if (plainText.indexOf(findStr) < 0) {
        return "";
     }
  }
  return plainText;
}

/*
  Returns: an array of type III reply blocks.
*/
function extractReplyBlock( sInputText){
    //var sExtracted =  extractText(sInputText, "^-----BEGIN TYPE III REPLY BLOCK-----", "^-----END TYPE III REPLY BLOCK-----");
    var sExtracted =  mixExtractText(sInputText, "-----BEGIN TYPE III REPLY BLOCK-----", "-----END TYPE III REPLY BLOCK-----");
    
    return sExtracted;
    
}

/*
  Tests whether the input string contains anonymous crypted messages.
*/
function isAnonCryptMessage( sInputText){
    var sAnonText = extractAnonMessage( sInputText);
    var sCryptPattern = new RegExp("Message-type: encrypted\nDecoding-handle:");
    
    return sCryptPattern.test(sAnonText);
}

/*
  Tests whether the input string contains a surb.
*/
function containsSurb( sInputText){
    var sAnonText = extractReplyBlock( sInputText);
    var sBeginPattern = new RegExp("-----BEGIN TYPE III REPLY BLOCK-----");
    var sEndPattern = new RegExp("-----END TYPE III REPLY BLOCK-----");
    
    return sBeginPattern.test(sAnonText) && sEndPattern.test(sAnonText);
}

/*
  Extracts a type III anonymous messages.
  Returns: an array of type III anonymous messages.
*/
function extractAnonMessage( sInputText){
    var sExtracted =  mixExtractText(sInputText, "-----BEGIN TYPE III ANONYMOUS MESSAGE-----", "-----END TYPE III ANONYMOUS MESSAGE-----");
    
    return sExtracted;
    
}

/*
  Returns an array of strings, containing all the occurrences of text found in 
  sInputText starting from sBegin until sEnd included(if not found until the end 
  of the input).
  Inspired by pemar.
*/
function extractText(sInputText,  sBegin,  sEnd) {
    // array of reply blocks.
    var asReturn = [];
    var iSurbCounter = 0;
    var textRows = sInputText.split("\n");
    var myreplyblock="";
    var collect=false;
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // TODO: these do not work, check it.
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//     var myRegStart = new RegExp(sBegin);
//     var myRegEnd = new RegExp(sEnd);
    for (var count=0; count < textRows.length; count++)
	{
	    if (textRows[count].match("/"+sBegin+"/")) { 
		collect=true;
	    }
	    if (collect)
		{
		    myreplyblock +=textRows[count] + "\n";
		}
	    if (textRows[count].match("/"+sEnd+"/")) { 
		collect=false;
		// Storing the parsed reply block.
		asReturn[iSurbCounter++] = myreplyblock;		
	    }	    
	}
    return asReturn;
}

/*
  Returns an array of strings, containing all the occurrences of text found in 
  sInputText starting from sBegin until sEnd included(if not found until the end 
  of the input).
  Inspired by pemar.
*/
function mixExtractText(sInputText,  sBegin,  sEnd) {
    // array of reply blocks.
    var asReturn = [];
    var iSurbCounter = 0;
    var textRows = sInputText.split("\n");
    var myreplyblock="";
    var collect=false;
    var myRegStart = new RegExp(sBegin);
    var myRegEnd = new RegExp(sEnd);
    for (var count=0; count < textRows.length; count++)
	{
	    if (myRegStart.test(textRows[count])) { 
		collect=true;
	    }
	    if (collect)
		{
		    myreplyblock +=textRows[count] + "\n";
		}
	    if (myRegEnd.test(textRows[count])) { 
		collect=false;
		// Storing the parsed reply block.
		asReturn[iSurbCounter++] = myreplyblock;		
	    }	    
	}
    return asReturn;
}

/*
  Returns the current profile email.
*/
function getCurrProfileEmail(){

    var identityElement = document.getElementById("msgIdentity");

    var gAccountManager = Components.classes["@mozilla.org/messenger/account-manager;1"].getService(Components.interfaces.nsIMsgAccountManager);
    if (identityElement) {
	var idKey = identityElement.value;	    
	var gCurrentIdentity = gAccountManager.getIdentity(idKey);
	return gCurrentIdentity.email;
    }
    return "";
}

/*
  Returns an array with the email (as a string) of each known profile.
*/
function getAllProfilesEmail(){

    var gAccountManager = Components.classes["@mozilla.org/messenger/account-manager;1"].getService(Components.interfaces.nsIMsgAccountManager);
    var asEmails = [];
    var aoIds = gAccountManager.allIdentities;
    var iIdsCounter = aoIds.Count();
    for(var iIdNr = 0; iIdNr< iIdsCounter; iIdNr++){
	var oCurrId = aoIds.QueryElementAt(iIdNr, Components.interfaces.nsIMsgIdentity);
	asEmails[iIdNr] = oCurrId.email;
    }
    
    return asEmails;
}

/*
  Checks whether sPath is a actual file path and whether 
  it leads to an actual file.

  sPath: the path to be checked.
  
  returns: true if the path leads to an existing file, false otherwise.
*/
function pathExists(sPath){
    try{
	var oTmpFile = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);  
	oTmpFile.initWithPath(sPath);  
	if(oTmpFile.exists()){
	    return true;
	}
	else{
	    return false;
	}
    }catch(oEx){
	return false;
    }
}

function showPrefs()
{
	var oReturn = {in: null, out:null};
        var oPrefs = window.openDialog("chrome://gui/content/mixPreferences.xul", "Mixminion Preferences", 
				       "modal, toolbar,location=yes, menubar=no,top=100, left=100px,width=100cm",oReturn);
	return oReturn.out.bValue;
}

function getLogFile(){

    var directoryService =  Components.classes["@mozilla.org/file/directory_service;1"]
	.getService(Components.interfaces.nsIProperties);
    var oLogFile = directoryService.get("ProfD", Components.interfaces.nsIFile);
    oLogFile.append(gLogFileName);

    if (!oLogFile.exists()){
	// if log file does not exist, create one.
	oLogFile.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);  
    }
    return oLogFile;

}

// TODO: add log levels.
function writeLog(sLogMessage){
    var oLogFile = getLogFile();

    var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].  
                            createInstance(Components.interfaces.nsIFileOutputStream);  
     
    // use 0x02 | 0x10 to open file in  append mode.  
    foStream.init(oLogFile, 0x02 | 0x10, 0666, 0);
    
    var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].  
	createInstance(Components.interfaces.nsIConverterOutputStream);  
    converter.init(foStream, "UTF-8", 0, 0);  
    converter.writeString("<p>" + sLogMessage);  
    converter.close(); // this closes foStream  
}

/*
  Returns a temp file path after writing sBody to it.
  sBody (string)
*/
function getTempFilePath(sBody){
    var oTmpFile = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
    oTmpFile.append("msg.tmp");  
    oTmpFile.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);  
    // do whatever you need to the created file  
    
    var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].  
                            createInstance(Components.interfaces.nsIFileOutputStream);  
     
    // use 0x02 | 0x10 to open file for appending.  
    foStream.init(oTmpFile, 0x02 | 0x08 | 0x20, 0666, 0);   
    // write, create, truncate  
    // In a c file operation, we have no need to set file mode with or operation,  
    // directly using "r" or "w" usually.  
    
    // if you are sure there will never ever be any non-ascii text in data you can   
    // also call foStream.writeData directly  
    var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].  
	createInstance(Components.interfaces.nsIConverterOutputStream);  
    converter.init(foStream, "UTF-8", 0, 0);  
    converter.writeString(sBody);  
    converter.close(); // this closes foStream  
    
    return oTmpFile;
}  

function removeFile(sTmpFilePath){
    try{
	var oTmpFile = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);  
	oTmpFile.initWithPath(sTmpFilePath);  
	if(oTmpFile.exists()){
	    oTmpFile.remove(false);
	}
    }catch(oEx){
	// alert(oEx.name + " " + oEx.message);
    }
}

/*
  Opens a file picker

  sText: File picker title.

  sDestinationId: Id of the textbox whose value 
  the selected path will be set to.
*/
function SelectFile(sText, sDestinationId){

    SelectFile(sText, sDestinationId,false);
//     const nsIFilePicker = Components.interfaces.nsIFilePicker;
    
//     var fp = Components.classes["@mozilla.org/filepicker;1"]
// 	.createInstance(nsIFilePicker);
//     fp.init(window, sText, nsIFilePicker.modeOpen);
//     fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText);

//     var rv = fp.show();
//     if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
// 	var file = fp.file;
// 	// Get the path as string. Note that you usually won't 
// 	// need to work with the string paths.
// 	var sFilePath = fp.file.path;
// 	// work with returned nsILocalFile...
// 	// TODO: this should refere to a function in a util file, 
// 	// se how to import an external file.
// 	if(sDestinationId != null){
// 	    var oDomEl = window.document.getElementById(sDestinationId);
// 	    if(oDomEl != null){
// 		window.document.getElementById(sDestinationId).value = sFilePath;
// 	    }
// 	}
//     }
}

/*
  Opens a file picker

  sText: File picker title.

  sDestinationId: Id of the textbox whose value 
  the selected path will be set to.
  
  bSaveMode: if true user can specify new files, if false user can
  select just existing files.
*/
function SelectFile(sText, sDestinationId, bSaveMode){

    const nsIFilePicker = Components.interfaces.nsIFilePicker;
    
    var fp = Components.classes["@mozilla.org/filepicker;1"]
	.createInstance(nsIFilePicker);
    var oOpenMode;
    if(bSaveMode){
	// setting save mode.
	oOpenMode = nsIFilePicker.modeSave;
    }
    else{
	// setting open mode.
	oOpenMode = nsIFilePicker.modeOpen;
    }

    fp.init(window, sText, oOpenMode);
    fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText);
    if(bSaveMode){
	fp.appendFilters(nsIFilePicker.modeSave);
    }

    var rv = fp.show();
    if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
	var file = fp.file;
	// Get the path as string. Note that you usually won't 
	// need to work with the string paths.
	var sFilePath = fp.file.path;
	// work with returned nsILocalFile...
	// TODO: this should refere to a function in a util file, 
	// se how to import an external file.
	if(sDestinationId != null){
	    var oDomEl = window.document.getElementById(sDestinationId);
	    if(oDomEl != null){
		window.document.getElementById(sDestinationId).value = sFilePath;
	    }
	}
    }
}

/*
  Retrieves the path of mixminion executable fom Thunderbird
  preferences.
  Returns: a string containing the path of mixminion.
*/
function getMixPathToPrefs(){

    // Getting extension preferences.
    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                    .getService(Components.interfaces.nsIPrefService).getBranch("extensions.");
    //    prefs.savePrefFile(null);

    // prefs is an nsIPrefBranch.
    // Look in the above section for examples of getting one.
    var sPath = ""; 
    if(prefs.prefHasUserValue("mixminionPath")) {
	// If the preference has bben set
	// getting mixminion path preference.
	sPath = prefs.getCharPref("mixminionPath"); 
    }else{
	// set an empty mixminion path preference.
	setMixPathToPrefs(sPath);
    }
    return sPath;
}

// ~/MixMinion/enigmail/ui/content/enigmailCommon.js
function MixGetFrame(win, frameName) {
  for (var j=0; j<win.frames.length; j++) {
    if (win.frames[j].name == frameName) {
      return win.frames[j];
    }
  }
  return null;
}

function MixParseChildNodes(node) {

  var plainText="";

  if (node.nodeType == Node.TEXT_NODE) {
    // text node
    plainText = plainText.concat(node.data);
  }
  else {

    if (node.nodeType == Node.ELEMENT_NODE) {
      if (node.tagName=="IMG" && node.className=="moz-txt-smily") {
        // get the "alt" part of graphical smileys to ensure correct
        // verification of signed messages
        if (node.getAttribute("alt")) {
            plainText = plainText.concat(node.getAttribute("alt"));
        }
      }
    }

    var child = node.firstChild;
    // iterate over child nodes
    while (child) {
      if (! (child.nodeType == Node.ELEMENT_NODE &&
            child.tagName == "BR" &&
            ! child.hasChildNodes())) {
        // optimization: don't do an extra loop for the very frequent <BR> elements
        plainText = plainText.concat(MixParseChildNodes(child));
      }
      child = child.nextSibling;
    }
  }

  return plainText;
}

/*
  Writes the given surbs (string[]) in a temp file.
  Returns the path of the file containning the given surbs.
*/
function surbsToGlobalFile(asSurb, goSurbFilea){

		// TODO: sanitize SURB.
		var sSurbsText = "";
		for(iSurb in asSurb){
		    var sSurbBegin = "-----BEGIN TYPE III REPLY BLOCK-----";
		    var sSurbEnd = "-----END TYPE III REPLY BLOCK-----";
		    
		    var sBeginPattern = new RegExp("- " + sSurbBegin);
		    var sEndPattern = new RegExp("- " + sSurbEnd);
		    var sSurb = asSurb[iSurb];
		    sSurb = sSurb.replace(sBeginPattern, sSurbBegin);
		    sSurb = sSurb.replace(sEndPattern, sSurbEnd);

		
		    sSurbsText +=sSurb + "\n";
		}
		var goSurbFile = getTempFilePath(sSurbsText);
		return goSurbFile.path;
}


function getPwd(){
    var oPwdParam = {in: null, out:null};
    window.openDialog("chrome://gui/content/mixPwdDialog.xul", "Passphrase", 
		      "modal, toolbar,location=yes, menubar=no,top=100",oPwdParam);
    if(oPwdParam == null){
	return null;
    }
    if(oPwdParam.out == null){
	return null;
    }
    return oPwdParam.out.sPassword;
}
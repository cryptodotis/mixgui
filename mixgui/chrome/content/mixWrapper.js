/*
  Global variable for temporary files reference. It may be used to
  remove tmp files from file system.
*/
var gsTmpFilePath;

/*
  Prompts for user email address and password and 
  generates iSurbCount SURBS.
*/
function generateSurb(iSurbCount, sAddress, sPassword){
    
    // This will contain two fields: 
    // - sAddress: the address to reply to,
    // - sPassword: the password to be used for surb generation.
    var asParameters = buildMixSurbParams(sAddress,iSurbCount);
    // TODO: validate surb generation
    var oResult;
    try{
	oResult = runMixminion(asParameters, sPassword, []);
    }catch(ex){
	return null;
    }
    var asReplyBLocks;
    if(oResult.status != 0){
	return asReplyBLocks;
    }
    var sOutput = oResult.message;
    asReplyBLocks = extractReplyBlock(sOutput);
//     if(asReplyBLocks.length != iSurbCount){
// 	// something went wrong, just exit
// 	alert(asReplyBLocks.count + "!=" + iSurbCount);
// 	return;
//     }
    // returning generated surbs.
    return asReplyBLocks;

}


/*  
    Call mixminion with the given parameters.

    asParameters: array of strings with mixminion parameters.
    asPreInput: (array of? strings) mixminion input given at program start, e.g. passphrases.
    sMixInput: (array of? strings) mixminion input given when program is already running.
    sOutput: string containing mixminion output.

    Returns: mixminion output string.
*/
function runMixminion(asParameters, asPreInput, sMixInput){
        
    var oMix = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
    // Mixminion complete path
    var sMixPath = getMixPathToPrefs();
    if(pathExists(sMixPath) == false){
	// file path in preferences is not a valid file path.
	// open preferences

	var bPrefsOk = showPrefs();
	if(!bPrefsOk){
	    alert("Mixminion path not set.");
	    return;
	}
	sMixPath = getMixPathToPrefs();

	// check result: 
	// - ok: run mixminion.
	// - cancel: return.
    }

    // TODO: check if path  exists.
//     oMix.initWithPath(sMixPath);
//     var run = Components.classes['@mozilla.org/process/util;1'].createInstance(Components.interfaces.nsIProcess);
//     run.init(oMix);
    
    // TODO: make this call async and handle temp file deletion
    // with an handler.
    // Blocking sync call to mixminion    

    /*
      Inspired by pemar code.
     */
    const NS_IPCSERVICE_CONTRACTID = "@mozilla.org/process/ipc-service;1";
    var ipcService; 
    ipcService = Components.classes[NS_IPCSERVICE_CONTRACTID].createInstance();
    if(ipcService == null){
	writeLog("ERROR: ipcService instance could not be created.");
    }
    ipcService = ipcService.QueryInterface(Components.interfaces.nsIIPCService);
    if(ipcService == null){
	writeLog("ERROR: ipcService interface could not be queried.");
    }

    var envList = []; 
    var preInput = asPreInput;
    var outObj = new Object();
    var errObj = new Object();
    var outLenObj = new Object();
    var errLenObj = new Object();
    var exitCodeObj    = new Object();
    var sInput = sMixInput;
    var command = sMixPath;
    for(sParCount in asParameters){
	command += " " + asParameters[sParCount];	
    }

    try {
	// I do not know the use of this, why don't set it true?
	var useShell = false;
	// mixminion is executed in a blocking mode.
	// TODO: run mixminion asyncrously and handle its termination.
	exitCodeObj.value = ipcService.execPipe(command,
						useShell,
						preInput,
						sInput, 0,
						envList, envList.length,
						outObj, outLenObj,
						errObj, errLenObj);
    } catch (ex) {
	exitCodeObj.value = -1;	
	writeLog("An exception has been thrown during mixminion execution.\nError code: " + exitCodeObj.value); 
	writeLog(" Command " + command);
    }
    var oResult = {status: -1, message: "", error: "", output: ""};
    oResult.output = outObj.value;
    oResult.error = errObj.value;
    var sOutput;
    if (outObj.value){
	// gettting stderr messages.
	sOutput = outObj.value;
    }else{
	sOutput ="";
    }   
    if (errObj.value){
	sOutput += errObj.value;
    }

    oResult.message = sOutput;

    if(exitCodeObj.value != 0){
	// TODO: notify error in status bar or file log.
	//	alert("Mixminion cuold not run properly.\nSee logs for more details");

    }else{
	// TODO: notify mixminion succesfully run in status bar or file log.
	//	alert("Mixminion succesfully run.\nSee logs for more details");
    }
    writeLog(sOutput);
    /*
      End of inspired by pemar code.
     */
    
    // removing the tmp file.    
    if(gsTmpFilePath){
	removeFile(gsTmpFilePath.path);
    }    
    
    // return the exit code and
    oResult.status = exitCodeObj.value;
    return oResult;
}

/*
  sReplyPath: path of the file containing the reply message(s) to be decoded.
*/
function buildMixDecodeParams(sReplyPath){
    
    var asParameters = ["decode --quiet", "--input="+ sReplyPath];
    
    return asParameters;
    
}

/*
  sAddress: string, the address the surb is made for, i.e. who
            will receive the reply.
  iSurbCount: int, how many surbs will be generated.
*/
function buildMixSurbParams(sAddress, iSurbCount){
    var sSurbCount = "-n " + iSurbCount;
    var sAddrParam = "-t " + sAddress;
    
    var asParameters = ["generate-surbs", sSurbCount, sAddrParam];
    
    return asParameters;
    
}

/*
  Generates command parameters for message queue inspection.
*/
function buildMixListQueueParams(){
    
    var asParameters = ["inspect-queue", "--quiet"];
    
    return asParameters;
    
}


/*
  Generates command parameters for message queue inspection.
*/
function buildMixListServersParams(){
    
    var asParameters = ["list-servers", "--quiet"];
    
    return asParameters;
    
}

/*
  Generates command parameters for message queue inspection.
*/
function buildMixInspectSurbParams(sFilePath){
    
    var asParameters = ["inspect-surbs", "--quiet", sFilePath];
    
    return asParameters;
    
}

/*
  Generates command parameters for message queue inspection.
*/
function buildMixFlushQueueParams(){
    
    var asParameters = ["flush"];
    
    return asParameters;
    
}

/*
  Generates command parameters for message queue inspection.
*/
function buildMixCleanQueueParams(iAge){
    
    var asParameters = ["clean-queue -d "+ iAge];
    
    return asParameters;
    
}

/*
  Returns the descriptor for the temp file
  storing mixminion queue content

*/
function getMixQueue(){
    
    var asParameters = buildMixListQueueParams();
    var oResult = runMixminion(asParameters, [], []);
    if(oResult.status != 0){
	alert("Unable to get queue content.\nSee logs for details.")
    }
    var oTmpFile = getTempFilePath(oResult.message);

    return oTmpFile;
}

/*
  Returns the descriptor for the temp file
  storing mixminion queue content

*/
function getMixServers(){
    
    var asParameters = buildMixListServersParams();
    var oResult = runMixminion(asParameters, [], []);
    if(oResult.status != 0){
	window.openDialog("chrome://gui/content/mixResultDialog.xul", "",
			  "chrome,centerscreen,modal",
			  {mainText: "Unable to get servers list.\nSee logs for details.", detailText: oResult.message});
    }
    var oTmpFile = getTempFilePath(oResult.message);

    return oTmpFile;
}

/*
  Returns the descriptor for the temp file
  storing mixminion queue content

*/
function getSurbContent(sSurbPath){
    
    var asParams = buildMixInspectSurbParams(sSurbPath);
    var oResult = runMixminion(asParams, [], []);
    if(oResult.status != 0){
	alert("Unable to get surb content.\nSee logs for details.");
	return null;
    }
    var oTmpFile = getTempFilePath(oResult.message);

    return oTmpFile;
}

/*
  Returns the descriptor for the temp file
  storing mixminion queue content

*/
function flushMixQueue(){
    
    var asParameters = buildMixFlushQueueParams();
    var oResult = runMixminion(asParameters, [], []);
    if(oResult.status != 0 || oResult.message.match("Error while delivering packets")){
	// alert window with error details
	// directly accessible by the user if he wants.
	window.openDialog("chrome://gui/content/mixResultDialog.xul", "",
			  "chrome,centerscreen,modal",
			  {mainText: "Unable to flush the output queue.\nSee logs for details.", detailText: oResult.message});
    }else{
	window.openDialog("chrome://gui/content/mixResultDialog.xul", "",
			  "chrome,centerscreen,modal",
			  {mainText: "Queue succesfully flushed.\nSee logs for details.", detailText: oResult.message});
    }
}

/*
  Returns the descriptor for the temp file
  storing mixminion queue content

*/
function cleanMixQueue(sAge){
    
    var asParameters = buildMixCleanQueueParams(sAge);
    var oResult = runMixminion(asParameters, [], []);
    if(oResult.status != 0){
	// alert window with error details
	// directly accessible by the user if he wants.
	window.openDialog("chrome://gui/content/mixResultDialog.xul", "",
			  "chrome,centerscreen,modal",
			  {mainText: "Unable to clean the output queue.\nSee logs for details.", detailText: oResult.message});
    }else{
	window.openDialog("chrome://gui/content/mixResultDialog.xul", "",
			  "chrome,centerscreen,modal",
			  {mainText: "Queue succesfully cleaned.\nSee logs for details.", detailText: oResult.message});
    }
}

function buildMixReplyParams(sSurb, sSubject, sBody, bSendNow){

    var bValidSurb = isValidFilePath(sSurb);
    if(!bValidSurb){
	alert("Please select a valid surb file path");
	return;
    }

    // TODO: check surb file exists.
    var oSurbFile = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);  
    oSurbFile.initWithPath(sSurb);  
    if(!oSurbFile.exists()){
	// if surb file does not exist warn the  user.
	alert("Selected SURB file does not exist");
	return;
    }

    var sRecParam = "--reply-block=" + sSurb;
    
    var sSubjParam = "--subject=" + "\"" + sSubject + "\"";
    // TODO: instead of creating a file for each recipient, the body
    // file can be generated once and then reused for each recipient.
    // creating a temp file for the body.
    gsTmpFilePath = getTempFilePath(sBody);
    var sBodyParam = "--input=" + gsTmpFilePath.path;
    
    var sSend = "send";
    if(!bSendNow){
	// enqueue the message.
	sSend +=" --queue";
    }

    // Parameters for the command.
    var asParameters = [sSend, sRecParam, sSubjParam, sBodyParam];
    
    return asParameters;
}

/*
  sAddress(string): recipient for the message, assuming it is 
  a well formed email address.
  sSubject(string): subject of the message.
  sBody(string):    content of the message.
  bSendNow: if true message will be sent immediately, otherwise it will be enqued.

  Returns an array of parameters for sending a mixminion message to a
  given recipient address.
*/
function buildMixParams(sAddress, sSubject, sBody, bSendNow){

    var sRecParam = "--to=" + sAddress;
    
    var sSubjParam = "--subject=" + "\"" + sSubject + "\"";
    // TODO: instead of creating a file for each recipient, the body
    // file can be generated once and then reused for each recipient.
    // creating a temp file for the body.
    gsTmpFilePath = getTempFilePath(sBody);
    var sBodyParam = "--input=" + gsTmpFilePath.path;
    
    var sSend = "send";
    if(!bSendNow){
	// enqueue the message.
	sSend +=" --queue";
    }
    // Parameters for the command.
    var asParameters = [sSend, sRecParam, sSubjParam, sBodyParam];
    
    return asParameters;
}

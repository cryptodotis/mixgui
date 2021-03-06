
/*
  Global variable for temporary files reference. It may be used to
  remove tmp files from file system.
*/
var goTmpFile;
var sSurbFilePath;
function onLoadHandler(){
    var oPar = window.arguments[0];
    if(oPar!= null){
	sSurbFilePath = oPar.surb;
	inspectSurb(sSurbFilePath);
    }
}

function closeHandler(){
    if(goTmpFile){
	removeFile(goTmpFile.path);
    }
}

function inspectSurb(sSurbPath){
	var oSurbView = window.document.getElementById("surbView");
	var sOldPath;
	if(goTmpFile){
	    sOldPath = goTmpFile.path;
	}
	goTmpFile = getSurbContent(sSurbPath);
	if(goTmpFile == null){
	    return;
	}
	
	// set file as src for the queue view.
	// convert the file to a URL so we can load it.
	ioService = Components.classes["@mozilla.org/network/io-service;1"]
	    .getService(Components.interfaces.nsIIOService);
	oSurbView.setAttribute("src", ioService.newFileURI(goTmpFile).spec);
	if(sOldPath){
	    removeFile(sOldPath);
	}
}

function btnSurbPathHandler(){
    SelectFile("Select mixminion path", "txtSurbPath", false);
    // run mixminion: inspect selected file 
    // show result on browser widget.
    var sSurbPath = document.getElementById("txtSurbPath").value;
    var asParams;
    if(sSurbPath){
	inspectSurb(sSurbPath);
    }
}

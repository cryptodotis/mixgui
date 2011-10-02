/*
  Global variable for temporary files reference. It may be used to
  remove tmp files from file system.
*/
var goTmpFile;

function init(){

    showServers();
  
}

function closeHandler(){
    if(goTmpFile){
	removeFile(goTmpFile.path);
    }
}

function showServers(){
	
    var oSrvsView = window.document.getElementById("srvsView");

    
    // for security, disable JS
    oSrvsView.docShell.allowJavascript = false; 

    // get queue content
    
    if(goTmpFile){
	removeFile(goTmpFile.path);
    }
    goTmpFile = getMixServers();


    // set file as src for the queue view.
    // convert the file to a URL so we can load it.
    ioService = Components.classes["@mozilla.org/network/io-service;1"]
                  .getService(Components.interfaces.nsIIOService);
    oSrvsView.setAttribute("src", ioService.newFileURI(goTmpFile).spec);
    
}

function btnRefreshHandler(){

    // show new queue content.   
    showServers();
}
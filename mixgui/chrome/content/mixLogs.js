
var gLogView;
var gLogFile;

function init(){

    gLogView = window.document.getElementById("logView");
    // for security, disable JS
    gLogView.docShell.allowJavascript = false; 

    gLogFile = getLogFile();

    // convert the file to a URL so we can load it.
    ioService = Components.classes["@mozilla.org/network/io-service;1"]
                  .getService(Components.interfaces.nsIIOService);
    gLogView.setAttribute("src", ioService.newFileURI(gLogFile).spec);
  
}

function btnClearLogsHandler(){
    // gLogFile = getLogFile();
    if (gLogFile.exists()){
	gLogFile.remove(false);
	gLogView.setAttribute("src", "about:blank"); // we don't have a log file to show
    }

}
function acceptHandler(){
    return true;
}

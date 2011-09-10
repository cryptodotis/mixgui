/*
  Global variable for temporary files reference. It may be used to
  remove tmp files from file system.
*/
var goTmpFile;

function init(){

    showQueueContent();
    
//     var oPattern = new RegExp("Message","gi");    
//     var sText = "long message message";
//     sText = sText.replace(oPattern,"aaa");
//     alert(sText);
  
}

function closeHandler(){
    removeFile(goTmpFile.path);
}

function showQueueContent(){

    var oQueueView = window.document.getElementById("queueView");
    // for security, disable JS
    oQueueView.docShell.allowJavascript = false; 

    // get queue content
    if(goTmpFile){
	removeFile(goTmpFile.path);
    }
    goTmpFile = getMixQueue();


    // set file as src for the queue view.
    // convert the file to a URL so we can load it.
    ioService = Components.classes["@mozilla.org/network/io-service;1"]
                  .getService(Components.interfaces.nsIIOService);
    oQueueView.setAttribute("src", ioService.newFileURI(goTmpFile).spec);
    
}

function btnFlushQueueHandler(){

    // build paramenters for mixminion to flush the message queue.   
    // execute mixminon.
    flushMixQueue();

    // show new queue content.   
    showQueueContent();
}

function btnCleanQueueHandler(){
    
    // TODO: add a parameter for specifying message age.
    // build paramenters for mixminion to clean the message queue.   
    // execute mixminon.
    var sAge = document.getElementById("txtMessageAge").value;
    cleanMixQueue(sAge);

    // show new queue content.   
    showQueueContent();
    
}

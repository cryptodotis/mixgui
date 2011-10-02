
function setMixPrefs(){

    showPrefs();
}

function showLogs(){
    var oPrefs = window.openDialog("chrome://gui/content/mixLogs.xul", "Mixminion Logs", 
				   "modal, toolbar,location=yes, menubar=no,top=100, left=100px");
}

function showQueue(){
    var oPrefs = window.openDialog("chrome://gui/content/mixQueue.xul", "Mixminion message queue", 
				   "modal, toolbar,location=yes, menubar=no,top=100, left=100px");
}

function showServers(){
    var oPrefs = window.openDialog("chrome://gui/content/mixServers.xul", "Mixminion message queue", 
				   "modal, toolbar,location=yes, menubar=no,top=100, left=100px");
}

function showCreateSurb(){
    var oPrefs = window.openDialog("chrome://gui/content/createSurb.xul", "Mixminion Surb creation", 
				   "modal, toolbar,location=yes, menubar=no,top=100, left=100px");
}

function showInspectSurb(){
    var oPrefs = window.openDialog("chrome://gui/content/inspectSurb.xul", "Mixminion Surb inspection", 
				   "modal, toolbar,location=yes, menubar=no,top=100, left=100px");
}
function showHelp(){
    alert("Mixminion help not available yet.");
}
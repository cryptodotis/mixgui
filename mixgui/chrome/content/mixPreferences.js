
function init(){
    // set the current mixminion's path as textbox content.
    var sPath = getMixPathToPrefs();
    window.document.getElementById("txtMixPath").value = sPath;

    if(pathExists(sPath) == true){
	window.arguments[0].out = {value:true};
    }
}


function acceptHandler(){
    var sMixPath = window.document.getElementById("txtMixPath").value;
    // file path validation.
    if(pathExists(sMixPath) == true){
	setMixPathToPrefs(sMixPath);
	window.arguments[0].out = {bValue:true};
	return true;
    }else{
	window.arguments[0].out = {bValue:false};
	return false;	
    }
}

function closeHandler(){
    var sMixPath = window.document.getElementById("txtMixPath").value;
    // file path validation.
    if(pathExists(sMixPath) == true){
	window.arguments[0].out = {bValue:true};
	return true;
    }else{
	window.arguments[0].out = {bValue:false};
	return false;	
    }
}


function btnMixPathHandler(){
    SelectFile("Select mixminion path", "txtMixPath");
}

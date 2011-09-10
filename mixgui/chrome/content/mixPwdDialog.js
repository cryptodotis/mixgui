function acceptHandler(){
    var sPwd = document.getElementById("txtPwd").value;
    	if(!sPwd){
	    return false;
	}

    window.arguments[0].out = {sPassword:sPwd};
    return true;
}
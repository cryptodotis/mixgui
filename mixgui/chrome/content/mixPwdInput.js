function acceptHandler(){
    var sPwd = document.getElementById("txtPwd").value;

    if(!sPwd){
	alert("Insert your secret key passphrase to create the surb.");
	return false;
    }

    if(window.arguments[0] != null){
	window.arguments[0].out = { sPassword:sPwd};
	return true;
    }

}
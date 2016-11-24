
var metawear = {
        deviceId : "",
    // this is MetaWear's UART service
//    serviceUUID: "326a9000-85cb-9195-d9dd-464cfbbae75a", //metawear
  //  txCharacteristic: "326a9001-85cb-9195-d9dd-464cfbbae75a", // transmit is from the phone's perspective
  //  rxCharacteristic: "326a9006-85cb-9195-d9dd-464cfbbae75a",  // receive is from the phone's perspective

    serviceUUID: "0000fc00-0000-1000-8000-00805f9b34fb", //cyberdisk
    txCharacteristic: "326a9001-85cb-9195-d9dd-464cfbbae75a", // transmit is from the phone's perspective
    rxCharacteristic: "0000fc22-0000-1000-8000-00805f9b34fb",  // cyberdisk read


	init: function (successCallback, failureCallback) {
    	console.log('initializing the metawear plugin');
        ble.isConnected(metawear.deviceId, successCallback, function (res) {metawear.isNotConnected(res, successCallback, failureCallback);});
    },
    isNotConnected: function(res, successCallback, failureCallback) {
        if (cordova.platformId === 'android') { // Android filtering is broken
            ble.scan([], 5, function (device) {metawear.onDiscoverDevice(device, successCallback, failureCallback);}, failureCallback);
        } else {
            ble.scan([metawear.serviceUUID], 5, function (device) {metawear.onDiscoverDevice(device, successCallback, failureCallback);}, failureCallback);
        }
    },
    onDiscoverDevice : function(device, successCallback, failureCallback) {
		console.log("device discovered: "+device.name);
        if (device.name === "MetaWear") {
           // console.log("FOUND METAWEAR" + JSON.stringify(device)+" device-id: "+device.id);
           // metawear.deviceId = device.id;                
           // ble.connect(device.id, successCallback, failureCallback);
           // return; //exit out after we find the metawear
        }
		else   if (device.name === "PE640") {
            console.log("FOUND PE640" + JSON.stringify(device)+" device-id: "+device.id);
            metawear.deviceId = device.id;                
            ble.connect(device.id, successCallback, failureCallback);
            return; //exit out after we find the metawear
        } 
		else {
            console.log('not metawear: ' + device.name);   
        }
    },
    writeData: function(buffer, success, failure) { // to to be sent to MetaWear
        if (!success) {
            success = function() {
//                console.log( "Sent: " + JSON.stringify(new Uint8Array(buffer)) );
            };
        }
  console.log( "Sent: " + JSON.stringify(new Uint8Array(buffer)) );
        if (!failure) {
            failure = metawear.onError;
        }
     //   ble.writeCommand(metawear.deviceId, metawear.serviceUUID, metawear.txCharacteristic, buffer, success, failure);
        ble.writeWithoutResponse(metawear.deviceId, metawear.serviceUUID, metawear.txCharacteristic, buffer, success, failure);
    },
  
	
	
	subscribeForIncomingData: function() {
        console.log(arguments);        
		ble.startNotification(metawear.deviceId, metawear.serviceUUID, metawear.rxCharacteristic, metawear.onDataReceived, metawear.onDataReceivedError);
	//	ble.startNotification(metawear.deviceId, "180f", "2a19", metawear.onDataReceived, metawear.onDataReceivedError);
//		ble.startNotification(metawear.deviceId, "326a9000-85cb-9195-d9dd-464cfbbae75a", "326a9008-85cb-9195-d9dd-464cfbbae75a", metawear.onDataReceived, metawear.onDataReceivedError);


//		ble.startNotification(metawear.deviceId, "180a", "2a24", metawear.onDataReceived, metawear.onDataReceivedError);
    },
    accLOCK : false,

	cinax:0, cinay:0, cinaz:0,
	cax:0, cay:0, caz:0,
	firstread:1,
	sashualox:0,
	sashualoy:0,
	sashualoz:0,
	smooth:0,

    
	onDataReceived : function(buffer) { // data received from MetaWear
        var data = new Uint8Array(buffer);
	    console.log('recv: ' + JSON.stringify(data));
        var message = "";

        if (data[0] === 1 && data[1] === 1) { // module = 1, opscode = 1
            if (data[2] === 1) 
				{ // button state
                message = "Button pressed";
				} 
			else 
				{
                message = "Button released";
	            }
			console.log("Metawear: " + message);
			} 
		else if (data[0] === 3 && data[1] === 4) 
			{ // module = 1, opscode = 1

            var d2 = data[2]; //
            var d3 = data[3];
            var d4 = data[4]; //
            var d5 = data[5]; // x values
            var d6 = data[6]; // y values
            var d7 = data[7]; // z values
			metawear.accelerometerVALS.x1 = d3;//-128;
            metawear.accelerometerVALS.y1 = d5;//-128;
			metawear.accelerometerVALS.z1 = d7;//-128;


			if (d3<128)
				{metawear.accelerometerVALS.x2 = d3;}
			else
				{metawear.accelerometerVALS.x2 = d3-256;}

			if (d5<128)
				{metawear.accelerometerVALS.y2 = d5;}
			else
				{metawear.accelerometerVALS.y2 = d5-256;}

			if (d7<128)
				{metawear.accelerometerVALS.z2 = d7;}
			else
				{metawear.accelerometerVALS.z2 = d7-256;}


			if (metawear.firstread==1)
				{
				metawear.cinax=metawear.accelerometerVALS.x2;
				metawear.cinay=metawear.accelerometerVALS.y2;
				metawear.cinaz=metawear.accelerometerVALS.z2;

				metawear.cax=metawear.accelerometerVALS.x1;
				metawear.cay=metawear.accelerometerVALS.y1;
				metawear.caz=metawear.accelerometerVALS.z1;

				metawear.firstread=0;
				}
			else
				{
				newvgx=metawear.accelerometerVALS.x2-metawear.cinax;
				newvgy=metawear.accelerometerVALS.y2-metawear.cinay;
				newvgz=metawear.accelerometerVALS.z2-metawear.cinaz;

				// ACHQAREBA
				 metawear.accelerometerVALS.vgx=parseInt( ((newvgx+ metawear.accelerometerVALS.vgx)/2) * 100)/100;
				metawear.accelerometerVALS.vgy=parseInt( ((newvgy+ metawear.accelerometerVALS.vgy)/2) * 100)/100;
				metawear.accelerometerVALS.vgz=parseInt( ((newvgz+ metawear.accelerometerVALS.vgz)/2) * 100)/100;

				 metawear.accelerometerVALS.vx=metawear.accelerometerVALS.x1-metawear.cax;
				 metawear.accelerometerVALS.vy=metawear.accelerometerVALS.y1-metawear.cay;
				 metawear.accelerometerVALS.vz=metawear.accelerometerVALS.z1-metawear.caz;


				//SICHQARE
				metawear.accelerometerVALS.mgx+=metawear.accelerometerVALS.vgx;
				metawear.accelerometerVALS.mgy+=metawear.accelerometerVALS.vgy;
				metawear.accelerometerVALS.mgz+=metawear.accelerometerVALS.vgz;

				if (metawear.accelerometerVALS.vgx==0)
					{
					if (metawear.accelerometerVALS.mgx>0)
						{metawear.accelerometerVALS.mgx-=0.5;}
					else if (metawear.accelerometerVALS.mgx<0)
						{metawear.accelerometerVALS.mgx+=0.5;}

					}
				if (metawear.accelerometerVALS.vgy==0)
					{
					if (metawear.accelerometerVALS.mgy>0)
						{metawear.accelerometerVALS.mgy-=0.5;}
					else if (metawear.accelerometerVALS.mgy<0)
						{metawear.accelerometerVALS.mgy+=0.5;}

					}

				if (metawear.accelerometerVALS.vgz==0)
					{
					if (metawear.accelerometerVALS.mgz>0)
						{metawear.accelerometerVALS.mgz-=0.5;}
					else if (metawear.accelerometerVALS.mgz<0)
						{metawear.accelerometerVALS.mgz+=0.5;}

					}
				metawear.accelerometerVALS.mgx=parseInt(metawear.accelerometerVALS.mgx*10)/10;
				metawear.accelerometerVALS.mgy=parseInt(metawear.accelerometerVALS.mgy*10)/10;
				metawear.accelerometerVALS.mgz=parseInt(metawear.accelerometerVALS.mgz*10)/10;

				metawear.accelerometerVALS.mx+=metawear.accelerometerVALS.vx;
				metawear.accelerometerVALS.my+=metawear.accelerometerVALS.vy;
				metawear.accelerometerVALS.mz+=metawear.accelerometerVALS.vz;

				metawear.accelerometerVALS.sx+=metawear.accelerometerVALS.mgx;
				metawear.accelerometerVALS.sy+=metawear.accelerometerVALS.mgy;
				metawear.accelerometerVALS.sz+=metawear.accelerometerVALS.mgz;

				if (metawear.smooth==1)
					{
					if (metawear.accelerometerVALS.mgx>7){metawear.accelerometerVALS.mgx=7;}
					if (metawear.accelerometerVALS.mgy>7){metawear.accelerometerVALS.mgy=7;}
					if (metawear.accelerometerVALS.mgz>7){metawear.accelerometerVALS.mgz=7;}
					if (metawear.accelerometerVALS.mgx<-7){metawear.accelerometerVALS.mgx=-7;}
					if (metawear.accelerometerVALS.mgy<-7){metawear.accelerometerVALS.mgy=-7;}
					if (metawear.accelerometerVALS.mgz<-7){metawear.accelerometerVALS.mgz=-7;}

					if (metawear.accelerometerVALS.vgx>3){metawear.accelerometerVALS.vgx=3;}
					if (metawear.accelerometerVALS.vgy>3){metawear.accelerometerVALS.vgy=3;}
					if (metawear.accelerometerVALS.vgz>3){metawear.accelerometerVALS.vgz=3;}
					if (metawear.accelerometerVALS.vgx<-3){metawear.accelerometerVALS.vgx=-3;}
					if (metawear.accelerometerVALS.vgy<-3){metawear.accelerometerVALS.vgy=-3;}
					if (metawear.accelerometerVALS.vgz<-3){metawear.accelerometerVALS.vgz=-3;}

					}
				if (metawear.accelerometerVALS.mgx==0)
					{
					if (metawear.accelerometerVALS.sx>0)
						{metawear.accelerometerVALS.sx-=1;}
					else if (metawear.accelerometerVALS.sx<0)
						{metawear.accelerometerVALS.sx+=1;}
					}
				if (metawear.accelerometerVALS.mgy==0)
					{
					if (metawear.accelerometerVALS.sy>0)
						{metawear.accelerometerVALS.sy-=1;}
					else if (metawear.accelerometerVALS.sy<0)
						{metawear.accelerometerVALS.sy+=1;}
					}

				if (metawear.accelerometerVALS.mgz==0)
					{
					if (metawear.accelerometerVALS.sz>0)
						{metawear.accelerometerVALS.sz-=1;}
					else if (metawear.accelerometerVALS.sz<0)
						{metawear.accelerometerVALS.sz+=1;}
					}

				metawear.accelerometerVALS.sx=parseInt(metawear.accelerometerVALS.sx*10)/10;
				metawear.accelerometerVALS.sy=parseInt(metawear.accelerometerVALS.sy*10)/10;
				metawear.accelerometerVALS.sz=parseInt(metawear.accelerometerVALS.sz*10)/10;


				metawear.cinax=metawear.accelerometerVALS.x2;
				metawear.cinay=metawear.accelerometerVALS.y2;
				metawear.cinaz=metawear.accelerometerVALS.z2;
				metawear.cax=metawear.accelerometerVALS.x1;
				metawear.cay=metawear.accelerometerVALS.y1;
				metawear.caz=metawear.accelerometerVALS.z1;


				}
            
			}
		if (message!="")
			{        console.log("MESSAGE FROM ONDATA: " + message);
			}

    },
    onDataReceivedError: function(res) {
        console.log(' Data Error: ' + JSON.stringify(res));
    },

    listenForButton : function(failureCallback, onDataReceived, onDataReceivedError){
        if (typeof onDataReceived == 'function'){
            console.log('replacing generic onDataReceived handler');
            //replace the generic one
          //  metawear.onDataReceived = onDataReceived;   
        }
        if (typeof onDataReceivedError == 'function'){
            console.log('replacing generic onDataReceivedError handler');
            //replace the generic one
       //     metawear.onDataReceivedError = onDataReceivedError;   
        }
      metawear.enableButtonFeedback( metawear.subscribeForIncomingData, failureCallback);  
    },
    accelerometerVALS : {
       x1 : 22,
       y1 : 22,
       z1 : 22,
		x2:22,
		y2:22,
		z2:22,
vgx:0,
vgy:0,
vgz:0,
mgx:0,
mgy:0,
mgz:0,

vx:0,
vy:0,
vz:0,

sx:0,
sy:0,
sz:0,


mx:0,
my:0,
mz:0

	   
	   },
    startAccelerometer : function(){


    },
    stopAccelerometer : function(){
        console.log("stop Accelerometer called");
        
    },
    disconnect: function(onSuccess, onError, event) {
        //make sure that the accelerometer is stopped
		funcrun=0;
		console.log("stop called");

        metawear.stopAccelerometer();

		var data = new Uint8Array(3);        
        data[0] = 0x02; // 
        data[1] = 0x02; // 
        // if 0 then just stop. if 1 then cancel the pattern
        data[2] = 0x00 ; 
        
         metawear.writeData(data.buffer);    
        ble.disconnect(metawear.deviceId, onSuccess, onError);
        metawear.deviceId = "";

    }
};

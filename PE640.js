
var cyberdisk = {
        deviceId : "",
    // this is cyberdisk's UART service
//    serviceUUID: "326a9000-85cb-9195-d9dd-464cfbbae75a", //cyberdisk
  //  txCharacteristic: "326a9001-85cb-9195-d9dd-464cfbbae75a", // transmit is from the phone's perspective
  //  rxCharacteristic: "326a9006-85cb-9195-d9dd-464cfbbae75a",  // receive is from the phone's perspective

    serviceUUID: "0000fc00-0000-1000-8000-00805f9b34fb", //cyberdisk
    txCharacteristic: "00002902-0000-1000-8000-00805f9b34fb", // transmit is from the phone's perspective
    rxCharacteristic: "00002a01-0000-1000-8000-00805f9b34fb",  // cyberdisk read

//00002902-0000-1000-8000-00805f9b34fb
	init: function (successCallback, failureCallback) {
    	console.log('initializing the cyberdisk plugin');
        ble.isConnected(cyberdisk.deviceId, successCallback, function (res) {cyberdisk.isNotConnected(res, successCallback, failureCallback);});
    },
    isNotConnected: function(res, successCallback, failureCallback) {
        if (cordova.platformId === 'android') { // Android filtering is broken
            ble.scan([], 5, function (device) {cyberdisk.onDiscoverDevice(device, successCallback, failureCallback);}, failureCallback);
        } else {
            ble.scan([cyberdisk.serviceUUID], 5, function (device) {cyberdisk.onDiscoverDevice(device, successCallback, failureCallback);}, failureCallback);
        }
    },
    onDiscoverDevice : function(device, successCallback, failureCallback) 
		{
		console.log("device discovered: "+device.name);
		if (device.name === "PE640") 
			{
            console.log("FOUND PE640" + JSON.stringify(device)+" device-id: "+device.id);
            cyberdisk.deviceId = device.id;                
            ble.connect(device.id, successCallback, failureCallback);
            return; //exit out after we find the cyberdisk
			} 
		else 
			{
            console.log('not cyberdisk: ' + device.name);   
	        }
		},
    writeData: function(buffer, success, failure) { // to to be sent to cyberdisk
        if (!success) {
            success = function() {
//                console.log( "Sent: " + JSON.stringify(new Uint8Array(buffer)) );
            };
        }
  console.log( "cyberdisk Sent: " + JSON.stringify(new Uint8Array(buffer)) );
        if (!failure) {
            failure = cyberdisk.onError;
        }
     //   ble.writeCommand(cyberdisk.deviceId, cyberdisk.serviceUUID, cyberdisk.txCharacteristic, buffer, success, failure);
        ble.writeWithoutResponse(cyberdisk.deviceId, cyberdisk.serviceUUID, cyberdisk.txCharacteristic, buffer, success, failure);
    },
  
	forceread: function()
	{
		console.log("reading");
	ble.read(cyberdisk.deviceId, cyberdisk.serviceUUID, cyberdisk.rxCharacteristic, cyberdisk.onDataReceived, cyberdisk.onDataReceivedError);
	},
	
	subscribeForIncomingData: function() {
        console.log("subscribing");        
		ble.startNotification(cyberdisk.deviceId, cyberdisk.serviceUUID, cyberdisk.rxCharacteristic, cyberdisk.onDataReceived, cyberdisk.onDataReceivedError);
	//	ble.startNotification(cyberdisk.deviceId, "180f", "2a19", cyberdisk.onDataReceived, cyberdisk.onDataReceivedError);
//		ble.startNotification(cyberdisk.deviceId, "326a9000-85cb-9195-d9dd-464cfbbae75a", "326a9008-85cb-9195-d9dd-464cfbbae75a", cyberdisk.onDataReceived, cyberdisk.onDataReceivedError);


//		ble.startNotification(cyberdisk.deviceId, "180a", "2a24", cyberdisk.onDataReceived, cyberdisk.onDataReceivedError);
    },
    accLOCK : false,

	cinax:0, cinay:0, cinaz:0,
	cax:0, cay:0, caz:0,
	firstread:1,
	sashualox:0,
	sashualoy:0,
	sashualoz:0,
	smooth:0,

    
	onDataReceived : function(buffer) { // data received from cyberdisk
        var data = new Uint8Array(buffer);
	    console.log('cyberdisk recv: ' + JSON.stringify(data));
        var message = "";
		
		if (data[0] === 3 && data[1] === 4) 
			{ // module = 1, opscode = 1

            var d2 = data[2]; //
            var d3 = data[3];
            var d4 = data[4]; //
            var d5 = data[5]; // x values
            var d6 = data[6]; // y values
            var d7 = data[7]; // z values
			cyberdisk.accelerometerVALS.x1 = d3;//-128;
            cyberdisk.accelerometerVALS.y1 = d5;//-128;
			cyberdisk.accelerometerVALS.z1 = d7;//-128;


			if (d3<128)
				{cyberdisk.accelerometerVALS.x2 = d3;}
			else
				{cyberdisk.accelerometerVALS.x2 = d3-256;}

			if (d5<128)
				{cyberdisk.accelerometerVALS.y2 = d5;}
			else
				{cyberdisk.accelerometerVALS.y2 = d5-256;}

			if (d7<128)
				{cyberdisk.accelerometerVALS.z2 = d7;}
			else
				{cyberdisk.accelerometerVALS.z2 = d7-256;}


			if (cyberdisk.firstread==1)
				{
				cyberdisk.cinax=cyberdisk.accelerometerVALS.x2;
				cyberdisk.cinay=cyberdisk.accelerometerVALS.y2;
				cyberdisk.cinaz=cyberdisk.accelerometerVALS.z2;

				cyberdisk.cax=cyberdisk.accelerometerVALS.x1;
				cyberdisk.cay=cyberdisk.accelerometerVALS.y1;
				cyberdisk.caz=cyberdisk.accelerometerVALS.z1;

				cyberdisk.firstread=0;
				}
			else
				{
				newvgx=cyberdisk.accelerometerVALS.x2-cyberdisk.cinax;
				newvgy=cyberdisk.accelerometerVALS.y2-cyberdisk.cinay;
				newvgz=cyberdisk.accelerometerVALS.z2-cyberdisk.cinaz;

				// ACHQAREBA
				 cyberdisk.accelerometerVALS.vgx=parseInt( ((newvgx+ cyberdisk.accelerometerVALS.vgx)/2) * 100)/100;
				cyberdisk.accelerometerVALS.vgy=parseInt( ((newvgy+ cyberdisk.accelerometerVALS.vgy)/2) * 100)/100;
				cyberdisk.accelerometerVALS.vgz=parseInt( ((newvgz+ cyberdisk.accelerometerVALS.vgz)/2) * 100)/100;

				 cyberdisk.accelerometerVALS.vx=cyberdisk.accelerometerVALS.x1-cyberdisk.cax;
				 cyberdisk.accelerometerVALS.vy=cyberdisk.accelerometerVALS.y1-cyberdisk.cay;
				 cyberdisk.accelerometerVALS.vz=cyberdisk.accelerometerVALS.z1-cyberdisk.caz;


				//SICHQARE
				cyberdisk.accelerometerVALS.mgx+=cyberdisk.accelerometerVALS.vgx;
				cyberdisk.accelerometerVALS.mgy+=cyberdisk.accelerometerVALS.vgy;
				cyberdisk.accelerometerVALS.mgz+=cyberdisk.accelerometerVALS.vgz;

				if (cyberdisk.accelerometerVALS.vgx==0)
					{
					if (cyberdisk.accelerometerVALS.mgx>0)
						{cyberdisk.accelerometerVALS.mgx-=0.5;}
					else if (cyberdisk.accelerometerVALS.mgx<0)
						{cyberdisk.accelerometerVALS.mgx+=0.5;}

					}
				if (cyberdisk.accelerometerVALS.vgy==0)
					{
					if (cyberdisk.accelerometerVALS.mgy>0)
						{cyberdisk.accelerometerVALS.mgy-=0.5;}
					else if (cyberdisk.accelerometerVALS.mgy<0)
						{cyberdisk.accelerometerVALS.mgy+=0.5;}

					}

				if (cyberdisk.accelerometerVALS.vgz==0)
					{
					if (cyberdisk.accelerometerVALS.mgz>0)
						{cyberdisk.accelerometerVALS.mgz-=0.5;}
					else if (cyberdisk.accelerometerVALS.mgz<0)
						{cyberdisk.accelerometerVALS.mgz+=0.5;}

					}
				cyberdisk.accelerometerVALS.mgx=parseInt(cyberdisk.accelerometerVALS.mgx*10)/10;
				cyberdisk.accelerometerVALS.mgy=parseInt(cyberdisk.accelerometerVALS.mgy*10)/10;
				cyberdisk.accelerometerVALS.mgz=parseInt(cyberdisk.accelerometerVALS.mgz*10)/10;

				cyberdisk.accelerometerVALS.mx+=cyberdisk.accelerometerVALS.vx;
				cyberdisk.accelerometerVALS.my+=cyberdisk.accelerometerVALS.vy;
				cyberdisk.accelerometerVALS.mz+=cyberdisk.accelerometerVALS.vz;

				cyberdisk.accelerometerVALS.sx+=cyberdisk.accelerometerVALS.mgx;
				cyberdisk.accelerometerVALS.sy+=cyberdisk.accelerometerVALS.mgy;
				cyberdisk.accelerometerVALS.sz+=cyberdisk.accelerometerVALS.mgz;

				if (cyberdisk.smooth==1)
					{
					if (cyberdisk.accelerometerVALS.mgx>7){cyberdisk.accelerometerVALS.mgx=7;}
					if (cyberdisk.accelerometerVALS.mgy>7){cyberdisk.accelerometerVALS.mgy=7;}
					if (cyberdisk.accelerometerVALS.mgz>7){cyberdisk.accelerometerVALS.mgz=7;}
					if (cyberdisk.accelerometerVALS.mgx<-7){cyberdisk.accelerometerVALS.mgx=-7;}
					if (cyberdisk.accelerometerVALS.mgy<-7){cyberdisk.accelerometerVALS.mgy=-7;}
					if (cyberdisk.accelerometerVALS.mgz<-7){cyberdisk.accelerometerVALS.mgz=-7;}

					if (cyberdisk.accelerometerVALS.vgx>3){cyberdisk.accelerometerVALS.vgx=3;}
					if (cyberdisk.accelerometerVALS.vgy>3){cyberdisk.accelerometerVALS.vgy=3;}
					if (cyberdisk.accelerometerVALS.vgz>3){cyberdisk.accelerometerVALS.vgz=3;}
					if (cyberdisk.accelerometerVALS.vgx<-3){cyberdisk.accelerometerVALS.vgx=-3;}
					if (cyberdisk.accelerometerVALS.vgy<-3){cyberdisk.accelerometerVALS.vgy=-3;}
					if (cyberdisk.accelerometerVALS.vgz<-3){cyberdisk.accelerometerVALS.vgz=-3;}

					}
				if (cyberdisk.accelerometerVALS.mgx==0)
					{
					if (cyberdisk.accelerometerVALS.sx>0)
						{cyberdisk.accelerometerVALS.sx-=1;}
					else if (cyberdisk.accelerometerVALS.sx<0)
						{cyberdisk.accelerometerVALS.sx+=1;}
					}
				if (cyberdisk.accelerometerVALS.mgy==0)
					{
					if (cyberdisk.accelerometerVALS.sy>0)
						{cyberdisk.accelerometerVALS.sy-=1;}
					else if (cyberdisk.accelerometerVALS.sy<0)
						{cyberdisk.accelerometerVALS.sy+=1;}
					}

				if (cyberdisk.accelerometerVALS.mgz==0)
					{
					if (cyberdisk.accelerometerVALS.sz>0)
						{cyberdisk.accelerometerVALS.sz-=1;}
					else if (cyberdisk.accelerometerVALS.sz<0)
						{cyberdisk.accelerometerVALS.sz+=1;}
					}

				cyberdisk.accelerometerVALS.sx=parseInt(cyberdisk.accelerometerVALS.sx*10)/10;
				cyberdisk.accelerometerVALS.sy=parseInt(cyberdisk.accelerometerVALS.sy*10)/10;
				cyberdisk.accelerometerVALS.sz=parseInt(cyberdisk.accelerometerVALS.sz*10)/10;


				cyberdisk.cinax=cyberdisk.accelerometerVALS.x2;
				cyberdisk.cinay=cyberdisk.accelerometerVALS.y2;
				cyberdisk.cinaz=cyberdisk.accelerometerVALS.z2;
				cyberdisk.cax=cyberdisk.accelerometerVALS.x1;
				cyberdisk.cay=cyberdisk.accelerometerVALS.y1;
				cyberdisk.caz=cyberdisk.accelerometerVALS.z1;


				}
            
			}
		if (message!="")
			{        console.log("cyberdisk MESSAGE FROM ONDATA: " + message);
			}

    },
    onDataReceivedError: function(res) {
        console.log(' Data Error: ' + JSON.stringify(res));
    },

    listenForButton : function(failureCallback, onDataReceived, onDataReceivedError){
        if (typeof onDataReceived == 'function'){
            console.log('cyberdisk replacing generic onDataReceived handler');
            //replace the generic one
            cyberdisk.onDataReceived = onDataReceived;   
        }
        if (typeof onDataReceivedError == 'function'){
            console.log(' cyberdiskreplacing generic onDataReceivedError handler');
            //replace the generic one
            cyberdisk.onDataReceivedError = onDataReceivedError;   
        }
      
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
   var data = new Uint8Array(3);
		data[0] = 0x01;
		data[1] = 0x01;
		data[2] = 0x01; 
        cyberdisk.writeData(data.buffer);
		cyberdisk.subscribeForIncomingData;

    },
    stopAccelerometer : function(){
        console.log(" cyberdisk stop Accelerometer called");
        
    },
    disconnect: function(onSuccess, onError, event) {
        //make sure that the accelerometer is stopped
		funcrun=0;
		console.log("cyberdisk stop called");

        cyberdisk.stopAccelerometer();

        
        ble.disconnect(cyberdisk.deviceId, onSuccess, onError);
        cyberdisk.deviceId = "";

    }
};

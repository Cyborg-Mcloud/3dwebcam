/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

//var cordova = require('cordova'),
  //  exec = require('cordova/exec');

var metawear = {
        deviceId : "",
    // this is MetaWear's UART service
    serviceUUID: "326a9000-85cb-9195-d9dd-464cfbbae75a",
    txCharacteristic: "326a9001-85cb-9195-d9dd-464cfbbae75a", // transmit is from the phone's perspective
    rxCharacteristic: "326a9006-85cb-9195-d9dd-464cfbbae75a",  // receive is from the phone's perspective
    
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
        if (device.name === "MetaWear") {
            console.log("FOUND METAWEAR" + JSON.stringify(device));
            metawear.deviceId = device.id;                
            ble.connect(device.id, successCallback, failureCallback);
            return; //exit out after we find the metawear
        } else {
            //console.log('not metawear: ' + device.name);   
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

    
	onDataReceived : function(buffer) { // data received from MetaWear
        var data = new Uint8Array(buffer);
        console.log('recv: ' + JSON.stringify(data));
        var message = "";

        if (data[0] === 1 && data[1] === 1) { // module = 1, opscode = 1
            if (data[2] === 1) { // button state
                message = "Button pressed";
            } else {
                message = "Button released";
            }
            console.log("Metawear: " + message);
        } else if (data[0] === 3 && data[1] === 4) { // module = 1, opscode = 1
      //      console.log('accelerometer data is: ' + JSON.stringify(data));
            var d2 = data[2]; //
            var d3 = data[3];
            var d4 = data[4]; //
            var d5 = data[5]; // x values
            var d6 = data[6]; // y values
            var d7 = data[7]; // z values
//			d3=(d3*1000+d2)/1000
//			d5=(d5*1000+d4)/1000
//			d7=(d7*1000+d6)/1000
  metawear.accelerometerVALS.x1 = d3;//-128;
            metawear.accelerometerVALS.y1 = d5;//-128;
			metawear.accelerometerVALS.z1 = d7;//-128;
d3=d3*6.28/255;
d5=d5*6.28/255;
d7=d7*6.28/255;


            metawear.accelerometerVALS.x2 = 100-parseInt(Math.cos(d3)*100);//-128;

            metawear.accelerometerVALS.y2 = 100-parseInt(Math.cos(d5)*100);//-128;

            metawear.accelerometerVALS.z2 =100- parseInt(Math.cos(d7)*100);//-128;
			
			d3=parseInt(d3*360/6.28);
			d5=parseInt(d5*360/6.28);
			d7=parseInt(d7*360/6.28);

         //   metawear.accelerometerVALS.x1 = d3;//-128;
         //   metawear.accelerometerVALS.y1 = d5;//-128;
			//metawear.accelerometerVALS.z1 = d7;//-128;
			if (d3>90 && d3<270)
				{
				metawear.accelerometerVALS.x2= - metawear.accelerometerVALS.x2;
				}

			if (d5>90 && d5<270)
				{
				metawear.accelerometerVALS.y2= - metawear.accelerometerVALS.y2;
				}

			if (d7>90 && d7<270)
				{
				metawear.accelerometerVALS.z2= - metawear.accelerometerVALS.z2;
				}

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
				 metawear.accelerometerVALS.vgx=metawear.accelerometerVALS.x2-metawear.cinax;
				 metawear.accelerometerVALS.vgy=metawear.accelerometerVALS.y2-metawear.cinay;
				 metawear.accelerometerVALS.vgz=metawear.accelerometerVALS.z2-metawear.cinaz;

				 metawear.accelerometerVALS.vx=metawear.accelerometerVALS.x1-metawear.cax;
				 metawear.accelerometerVALS.vy=metawear.accelerometerVALS.y1-metawear.cay;
				 metawear.accelerometerVALS.vz=metawear.accelerometerVALS.z1-metawear.caz;


				metawear.accelerometerVALS.mgx+=metawear.accelerometerVALS.vgx;
				metawear.accelerometerVALS.mgy+=metawear.accelerometerVALS.vgy;
				metawear.accelerometerVALS.mgz+=metawear.accelerometerVALS.vgz;

				if (metawear.accelerometerVALS.vgx==0)
					{
					metawear.accelerometerVALS.mgx=0;
//					if (metawear.accelerometerVALS.mgx>0)
//						{metawear.accelerometerVALS.mgx=0;}
//					else if (metawear.accelerometerVALS.mgx<0)
//						{metawear.accelerometerVALS.mgx+=1;}
					}

				if (metawear.accelerometerVALS.vgy==0)
					{
					metawear.accelerometerVALS.mgy=0;
					}

				if (metawear.accelerometerVALS.vgz==0)
					{
					metawear.accelerometerVALS.mgz=0;
					}

				metawear.accelerometerVALS.mx+=metawear.accelerometerVALS.vx;
				metawear.accelerometerVALS.my+=metawear.accelerometerVALS.vy;
				metawear.accelerometerVALS.mz+=metawear.accelerometerVALS.vz;

				metawear.accelerometerVALS.sx+=metawear.accelerometerVALS.mgx;
				metawear.accelerometerVALS.sy+=metawear.accelerometerVALS.mgy;
				metawear.accelerometerVALS.sz+=metawear.accelerometerVALS.mgz;
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
    enableButtonFeedback: function(success, failure) {
        var data = new Uint8Array(6);
        data[0] = 0x01; // mechanical switch
        data[1] = 0x01; // switch state ops code
        data[2] = 0x01; // enable

        metawear.writeData(data.buffer, success, failure);
    },
    COLOR : { // 00 is GREEN, 01 is RED, 02 is BLUE
        "RED" : 0x01,
        "GREEN" : 0x00,
        "BLUE" : 0x02
    },
    setLED: function(color){
        var data = new Uint8Array(17);        
        data[0] = 0x02; // Color Register
        data[1] = 0x03; // 
        data[2] = ((color !== undefined) ? color : metawear.COLOR.GREEN); // THIS IS THE COLOR SLOT  00 is GREEN, 01 is RED, 02 is BLUE
        data[3] = 0x02; // 
        data[4] = 0x1F; // high intensity  1F for solid
        data[5] = 0x64; // low intensity 64 for solid
        data[6] = 0x01; // 
        data[7] = 0x01; // 
        data[8] = 0x01; // 
        data[9] = 0x01; // high intensity
        data[10] = 0x01; // low intensity
        data[11] = 0x01; // Rise Time
        data[12] = 0x01; // High Time
        data[13] = 0x01; // Fall time
        data[14] = 0x00; // Pulse Duration 
        data[15] = 0x00; // Pulse Offset 
        data[16] = 0x00; //repeat count

        metawear.writeData(data.buffer);
    },
    play : function(autoplay) {
        var data = new Uint8Array(3);        
        data[0] = 0x02; // 
        data[1] = 0x01; // 
        
        //assuming next value is for autoplay
        //TODO which of the 3 location is the autoplay value? data[1] or data[2]??
        var isautoplay = ((autoplay === true) ? 0x02 : 0x01);
        data[2] = isautoplay; // 
        //data[2] = 0x01;
        
        
         metawear.writeData(data.buffer);    
    },
    pause : function() {
       var data = new Uint8Array(3);        
        data[0] = 0x02; // 
        data[1] = 0x01; // 
        data[2] = 0x00; // 
        
         metawear.writeData(data.buffer);    
    },
    stop : function(clearPattern) {
        var data = new Uint8Array(3);        
        data[0] = 0x02; // 
        data[1] = 0x02; // 
        // if 0 then just stop. if 1 then cancel the pattern
        data[2] = ((clearPattern === true) ? 0x01 : 0x00); 
        
         metawear.writeData(data.buffer);    
    },
    motor: function(pulseLength) {
        var pulseWidth = pulseLength;
        var data = new Uint8Array(6);
        data[0] = 0x07; // module
        data[1] = 0x01; // pulse ops code
        data[2] = 0x80; // Motor
        data[3] = pulseWidth & 0xFF; // Pulse Width
        data[4] = pulseWidth >> 8; // Pulse Width
        data[5] = 0x00; // Some magic bullshit

        metawear.writeData(data.buffer);
    },
    buzzer: function(pulseLength) {
        var pulseWidth = pulseLength;
        var data = new Uint8Array(6);
        data[0] = 0x07; // module
        data[1] = 0x01; // pulse ops code
        data[2] = 0xF8; // Buzzer
        data[3] = pulseWidth & 0xFF; // Pulse Width
        data[4] = pulseWidth >> 8; // Pulse Width
        data[5] = 0x01; // Some magic?

        metawear.writeData(data.buffer);
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
//const OUTPUT_DATA_RATE = {
//    "0.78125": 0x1,
//    "1.5625":  0x2,
//    "3.125":   0x3,
//    "6.25":    0x4,
//    "12.5":    0x5,
//    "25.0":    0x6,
//    "50.0":    0x7,
//    "100.0":   0x8,
//    "200.0":   0xa,
//    "400.0":   0xb,
//    "800.0":   0xc,
//    "1600.0":  0xd,
//    "3200.0":  0xe


// Supported g-ranges for the accelerometer. Unit "g"
//const ACC_RANGE = {
    //g     bitmask, scale
//    2:      [0x3,    16384],
//    4:      [0x5,    8192],
//    8:      [0x8,    4096],
//    16:     [0xc,    2048]
//};

//https://github.com/brainexe/node-metawear/blob/master/src/registers/accelerometer.js

        console.log("startAccelerometer called");
        //start the accelerometer
     
	   var data = new Uint8Array(3);
		data[0] = 0x03;
		data[1] = 0x04;
		data[2] = 0x01; 
        metawear.writeData(data.buffer);

//		var data = new Uint8Array(4);
//		data[0] = 0x03;
//		data[1] = 0x0d;
//		data[2] = 0x04; 
//		data[3] = 0x0a; 
//        metawear.writeData(data.buffer); // TAP config

//		var data = new Uint8Array(6);
//		data[0] = 0x03;
//		data[1] = 0x0a;
//		data[2] = 0x00; 
//		data[3] = 0x14; 
//		data[4] = 0x14; 
//		data[5] = 0x14; 
//        metawear.writeData(data.buffer); // Motion Config


		var data = new Uint8Array(4);
		data[0] = 0x03;
		data[1] = 0x03;
		data[2] = 0x27;  // 0x20 + herz
		data[3] = 0x03;  // G Sens
        metawear.writeData(data.buffer); // setting 50hz and 2G

        var data = new Uint8Array(3);
        data[0] = 0x03; 
        data[1] = 0x01; 
        data[2] = 0x01; 
        metawear.writeData(data.buffer); // POWER enable

//		[0x03, 0x03, 0x02, 0x00, 0x18, 0x00, 0x00] - some other G setting

		data = new Uint8Array(4);
		data[0] = 0x03;
		data[1] = 0x02;
		data[2] = 0x01;
		data[3] = 0x00;
        metawear.writeData(data.buffer); // AXIS sampling



    },
    stopAccelerometer : function(){
        console.log("stop Accelerometer called");
        //stop track x
        var datax = new Uint8Array(4);
        datax[0] = 0x03; // module accelerometer
        datax[1] = 0x02; // 
        datax[2] = 0x00; // stop
        datax[3] = 0x01; // stop
        metawear.writeData(datax.buffer);
        //stop track y
        var datay = new Uint8Array(3);
        datay[0] = 0x03; // module accelerometer
        datay[1] = 0x04; // 
        datay[2] = 0x00; // stop
        metawear.writeData(datay.buffer);

		var datay = new Uint8Array(3);
        datay[0] = 0x03; // module accelerometer
        datay[1] = 0x01; // 
        datay[2] = 0x00; // stop
        metawear.writeData(datay.buffer);
        //stop track z
     
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

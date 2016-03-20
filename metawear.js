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
//        ble.writeCommand(metawear.deviceId, metawear.serviceUUID, metawear.txCharacteristic, buffer, success, failure);
        ble.writeWithoutResponse(metawear.deviceId, metawear.serviceUUID, metawear.txCharacteristic, buffer, success, failure);
    },
    subscribeForIncomingData: function() {
        console.log(arguments);        
		ble.startNotification(metawear.deviceId, metawear.serviceUUID, metawear.rxCharacteristic, metawear.onDataReceived, metawear.onDataReceivedError);
//		ble.startNotification(metawear.deviceId, "180a", "2a24", metawear.onDataReceived, metawear.onDataReceivedError);
    },
    accLOCK : false,
    
	onDataReceived : function(buffer) { // data received from MetaWear
        var data = new Uint8Array(buffer);
        console.log('the data is: ' + JSON.stringify(data));
        var message = "";

        if (data[0] === 1 && data[1] === 1) { // module = 1, opscode = 1
            if (data[2] === 1) { // button state
                message = "Button pressed";
            } else {
                message = "Button released";
            }
            console.log("Metawear: " + message);
        } else if (data[0] === 3 && data[1] === 4) { // module = 1, opscode = 1
            console.log('accelerometer data is: ' + JSON.stringify(data));
            //TODO guessing as the xyz values
            var d2 = data[2]; //
            var d3 = data[3];
            var d4 = data[4]; //
            var d5 = data[5]; // x values
            var d6 = data[6]; // y values
            var d7 = data[7]; // z values
            //all the rest of the values are the same
            
            message = "Got accelerometer information: [2]" 
                + d2 + ",[3]" + d3
            + ",[4]" + d4
            + ",[5]" + d5
            + ",[6]" + d6
            + ",[7]" + d7;
            console.log("ACCELEROMETER MESSAGE: " + message);
            
        
            
            //reset accelerometer values
            metawear.accelerometerVALS.x = d5;
            metawear.accelerometerVALS.y = d6;
            metawear.accelerometerVALS.z = d7;
            
        }

        console.log("MESSAGE FROM ONDATA: " + message);
    },
    onDataReceivedError: function(res) {
        console.log('Bluetooth Data Error: ' + JSON.stringify(res));
    },
    listenForButton : function(failureCallback, onDataReceived, onDataReceivedError){
        if (typeof onDataReceived == 'function'){
            console.log('replacing generic onDataReceived handler');
            //replace the generic one
            metawear.onDataReceived = onDataReceived;   
        }
        if (typeof onDataReceivedError == 'function'){
            console.log('replacing generic onDataReceivedError handler');
            //replace the generic one
            metawear.onDataReceivedError = onDataReceivedError;   
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
 
    accelerometerVALS : {
       x : 22,
       y : 22,
       z : 22
    },
    startAccelerometer : function(){
        console.log("startAccelerometer called");
        //start the accelerometer
        var data = new Uint8Array(7);
        data[0] = 0x03; // module accelerometer
        data[1] = 0x03; // 
        data[2] = 0x01; // 
        data[3] = 0x00;
        data[4] = 0x20; //
        data[5] = 0x00;
        data[6] = 0x01;

        metawear.writeData(data.buffer);
        
        //track x
        var datax = new Uint8Array(3);
        datax[0] = 0x03; // module accelerometer
       datax[1] = 0x02; // 
        datax[2] = 0x01; // start
        metawear.writeData(datax.buffer);
        //track y
        var datay = new Uint8Array(3);
        datay[0] = 0x03; // module accelerometer
        datay[1] = 0x04; // 
        datay[2] = 0x01; // start
        metawear.writeData(datay.buffer);
        //track z
        var dataz = new Uint8Array(3);
        dataz[0] = 0x03; // module accelerometer
        dataz[1] = 0x01; // 
        dataz[2] = 0x01; // start
        metawear.writeData(dataz.buffer);

       var datat = new Uint8Array(3);
        datat[0] = 0x04; // module accelerometer
        datat[1] = 0x01; // 
        datat[2] = 0x01; // start
        metawear.writeData(datat.buffer);


       var datat1 = new Uint8Array(3);
        datat1[0] = 0x04; // module accelerometer
        datat1[1] = 0x03; // 
        datat1[2] = 0x01; // start
        metawear.writeData(datat1.buffer);


		ble.startNotification(metawear.deviceId, metawear.serviceUUID, metawear.rxCharacteristic, metawear.onDataReceived, metawear.onDataReceivedError);
console.log("subscribed");
    },
    stopAccelerometer : function(){
        console.log("stopAccelerometer called");
        //stop track x
        var datax = new Uint8Array(3);
        datax[0] = 0x03; // module accelerometer
        datax[1] = 0x02; // 
        datax[2] = 0x00; // stop
        metawear.writeData(datax.buffer);
        //stop track y
        var datay = new Uint8Array(3);
        datay[0] = 0x03; // module accelerometer
        datay[1] = 0x04; // 
        datay[2] = 0x00; // stop
        metawear.writeData(datay.buffer);
        //stop track z
        var dataz = new Uint8Array(3);
        dataz[0] = 0x03; // module accelerometer
        dataz[1] = 0x01; // 
        dataz[2] = 0x00; // stop
        metawear.writeData(dataz.buffer);
    },
    disconnect: function(onSuccess, onError, event) {
        //make sure that the accelerometer is stopped
        metawear.stopAccelerometer();
        ble.disconnect(metawear.deviceId, onSuccess, onError);
        metawear.deviceId = "";
    }
};

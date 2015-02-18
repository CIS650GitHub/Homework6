var os = require('os');
var crypto = require('crypto');
var http = require('http');
var express = require('express');
var connect = require("connect");
var blessed = require('blessed');
var bodyParser = require('body-parser');
var app = express();
var my_ip = "128.223.4.35";

var numNodesInsecureChannel = 0;
var numNodesOnSecureChannel = 0;
//fake mac addresses and public keys which can be replaced later 
var validNodes = [];
var validMacAddresses = [ "abc", "def", "ghi","jkl"];


var validPublicKeys = [ "node1.pub", "node2.pub","node3.pub", "node3.pub"];

var dictNodes = {
     "abc": "31",
	 "def": "53",
	 "ghi": "283",
	 "jkl": "307"
}

var sharedKeyWithCS = "123456789";

var ifaces = os.networkInterfaces();
Object.keys(ifaces).forEach(function(ifname) {
	var alias = 0;
	ifaces[ifname].forEach(function(iface) {
	if ('IPv4' !== iface.family || iface.internal !== false) {
		return;
	}
	if (alias >= 1) {
		my_ip = iface.address;
	} else {
		my_ip = iface.address;
	}
 });
});

app.use(bodyParser.urlencoded());

// Create a screen object.
var screen = blessed.screen();

var list = blessed.list({
	parent: screen,
	width: '50%',
	height: '100%',
	top: 0,
	left: 0,
	align: 'center',
	fg: 'blue',
	border: {
	type: 'line'
	},
	//selectedBg: 'white',
	selectedBold: true,
	mouse: true,
	keys: true,
	vi: true
});


list.prepend(new blessed.Text({
left: 2,
content: ' This node is ' + my_ip
}));



var logCount = 0;

function myLogs(log) {
	list.add("" + log);
	list.focus();
	list.select(logCount++);
	screen.render();
}




app.set('port', process.env.PORT || 4000);

var http = require('http');
var fs = require('fs');
var querystring = require('querystring');

screen.render();



var discoverWorker = new Discover({
	helloInterval: 1000,
	checkInterval: 2000,
	nodeTimeout: 2000,
	masterTimeout: 2000
});

var discoverCriticalSection = new Discover({
	helloInterval: 1000,
	checkInterval: 2000,
	nodeTimeout: 2000,
	masterTimeout: 2000,
	key: sharedKeyWithCS
});

//register callback functions for worker nodes
registerCallbacks();

//register callback functions for secure channel to critical section
registerCallbacksCS();


function receiveMessageCriticalSection(data){

   
}

function receiveMessageWorker(data){
   
   //got request to join the secure channel 
  var encryptedMAC = data.macEncrypted;
  var encryptedIP = data.ipEncrypted;

  
  
   
   
}

function registerCallbacks() {
	discoverWorker.on("promotion", function() {

		var success = d.join(my_ip, receiveMessageWorker);
		if (!success) {
		//myLogs("could not join that channel; probably because it is reserved");
		}
	});

	discoverWorker.on("demotion", function() {
	});
	discoverWorker.on("added", function(obj) {
		numNodesInsecureChannel++;
		myLogs("Other nodes " + numNodesInsecureChannel);
	});
	
	discoverWorker.on("removed", function(obj) {
		numNodesInsecureChannel--;
		myLogs("Other nodes " + numNodesInsecureChannel);
	});

	discoverWorker.on("master", function(obj) {
		master_ip = obj.address;
		var success = d.join(master_ip, receiveMessageWorker);
		if (!success) {
         //myLogs("slave could not join that channel; probably because it is reserved");
		}
	});
}

function registerCallbacksCS() {
	discoverCriticalSection.on("promotion", function() {

		var success = d.join("critical", receiveMessageCriticalSection);
		if (!success) {
		//myLogs("could not join that channel; probably because it is reserved");
		}
	});

	discoverCriticalSection.on("demotion", function() {
	});
	discoverCriticalSection.on("added", function(obj) {
		
	});
	
	discoverCriticalSection.on("removed", function(obj) {
		numNodesOnSecureChannel--;
		myLogs("Other nodes " + numNodesOnSecureChannel);
	});

	discoverCriticalSection.on("master", function(obj) {
		master_ip = obj.address;
		
	});
}


// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
	return process.exit(0);
});

screen.render();

http.createServer(app).listen(app.get('port'), function() {
	myLogs("Express server listening on port " + app.get('port'));
});
process.on('uncaughtException', function(err) {
	console.log('Caught exception: ' + err);
});
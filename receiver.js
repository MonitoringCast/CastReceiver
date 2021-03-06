var ctx = document.getElementById("myChart");
var data = [];

var scatterChart = new Chart(ctx, {
	type: 'line',
	data: {
		datasets: [{
			spanGaps: false,
			label: "My First dataset",
			fill: true,
			lineTension: 0.1,
			backgroundColor: "rgba(75,192,192,0.4)",
			borderColor: "rgba(75,192,192,1)",
			borderCapStyle: 'butt',
			borderDash: [],
			borderDashOffset: 0.0,
			borderJoinStyle: 'miter',
			pointBorderColor: "rgba(100,162,122,1)",
			pointBackgroundColor: "#fff",
			pointBorderWidth: 1,
			pointHoverRadius: 5,
			pointHoverBackgroundColor: "rgba(100,162,122,1)",
			pointHoverBorderColor: "rgba(100,162,122,1)",
			pointHoverBorderWidth: 2,
			pointRadius: 1,
			pointHitRadius: 10,
			label: 'Test Set 2',
			data: data
		}]
	},
	options: {
		scales: {
			xAxes: [{
				type: 'time',
				time: {
					displayFormats: {
						quarter: 'MMM YYYY'
					}
				}
			}]
		}
	}
});


window.onload = function() {
	cast.receiver.logger.setLevelValue(0);
	var castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
	console.log('Starting Receiver Manager');
			
	// handler for the 'ready' event
	castReceiverManager.onReady = function(event) {
		console.log('Received Ready event: ' + JSON.stringify(event.data));
		castReceiverManager.setApplicationState("Application status is ready...");
	};
			
	// handler for 'senderconnected' event
	castReceiverManager.onSenderConnected = function(event) {
		console.log('Received Sender Connected event: ' + event.data);
		console.log(castReceiverManager.getSender(event.data).userAgent);
		// TODO: add here tje connection to the backend
	};
			
	// handler for 'senderdisconnected' event
	castReceiverManager.onSenderDisconnected = function(event) {
		console.log('Received Sender Disconnected event: ' + event.data);
		if (castReceiverManager.getSenders().length == 0) {
			window.close();
		}
	};
			
	// handler for 'systemvolumechanged' event
	castReceiverManager.onSystemVolumeChanged = function(event) {
		console.log('Received System Volume Changed event: ' + event.data['level'] + ' ' + event.data['muted']);
	};

	// create a CastMessageBus to handle messages for a custom namespace
	var messageBus = castReceiverManager.getCastMessageBus('urn:x-cast:com.google.cast.sample.helloworld');
	var messageBus2 = castReceiverManager.getCastMessageBus('urn:x-cast:message2');

	// handler for the CastMessageBus message event
	messageBus.onMessage = function(event) {
		console.log('Message [' + event.senderId + ']: ' + event.data);
		// inform all senders on the CastMessageBus of the incoming message event
		// sender message listener will be invoked
		console.log("Message received from sender:");
		//TODO: we need to receive JSON. We need to check window.ws to see if it is open.
		console.log(event.data);

//		var ws = new WebSocket(event.data, []);
		var ws = new WebSocket("ws://moncalliste.com:8020/graph", []);
		ws.onopen = function() {
			console.log("WEBSOCKET OPEN");
			// Web Socket is connected, send data using send()
			ws.send('{"user": "user1","pass":"pass1","layout":"layout1"}');
			alert("connection open");
		};

		ws.onmessage = function (evt) { 
			var received_msg = JSON.parse(evt.data);
			data.push(received_msg)
			scatterChart.update();
			console.log(data);
		};

		messageBus.send(event.senderId, event.data);
	};

	// initialize the CastReceiverManager with an application status message
	castReceiverManager.start({statusText: "Application is starting"});
	console.log('Receiver Manager started');
};

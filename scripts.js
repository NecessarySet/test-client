const app = document.getElementById('root');

const logo = document.createElement('img');
logo.src = 'logo.png';

const container = document.createElement('div');
container.setAttribute('class', 'container');

app.appendChild(logo);
app.appendChild(container);

const card = document.createElement('div');
card.setAttribute('class', 'card');
const h1 = document.createElement('h1');
h1.setAttribute('class', 'cardheader');

const cpuP = document.createElement('p');
cpuP.setAttribute('class', 'cpuP');
const memP = document.createElement('p');
memP.setAttribute('class', 'memP');

container.appendChild(card);
card.appendChild(h1);
card.appendChild(cpuP);
card.appendChild(memP);

container.appendChild(card)

function pollFunc(fn, timeout, interval) {
    	var startTime = (new Date()).getTime();
    	interval = interval || 1000,
    	canPoll = true;

    	(function p() {
        	canPoll = ((new Date).getTime() - startTime ) <= timeout;
        	if (!fn() && canPoll)  { // ensures the function exucutes
            		setTimeout(p, interval);
        	}
    	})();
}

function infinitePollFunc(fn, interval) {
    	interval = interval || 1000,
    	canPoll = true;

    	(function p() {
        	if (!fn())  { // ensures the function exucutes
            		setTimeout(p, interval);
        	}
    	})();
}

function sendHeartBeat(params) {

	console.log("hello");

	var request = new XMLHttpRequest();
	request.open('GET', 'http://192.168.3.210:6502/v1/api/data/status', true);
	request.onload = function () {
		if (request.status >= 200 && request.status < 400) {

			// Begin2d accessing JSON data here
  			var reading = JSON.parse(this.response);

			const cardheader = document.getElementsByClassName('cardheader')[0];
			cardheader.textContent = `Reading ${(new Date()).getTime()}`;
		
			const cpuP = document.getElementsByClassName('cpuP')[0];
			cpuP.textContent = `CPU: ${reading.CPU}`;
		
			const memP = document.getElementsByClassName('memP')[0];
			memP.textContent = `Memory: ${reading.Memory}`;

		} else {
			//handle errors
    			const errorMessage = document.createElement('marquee');
    			errorMessage.textContent = `Gah, it's not working!`;
    			app.appendChild(errorMessage);
		}

	}

	request.send();

	//some additional info for ending things
	receivedData = false;
	if (receivedData) {
        	// no need to execute further
        	return true; // or false, change the IIFE inside condition accordingly.
    	}
}

//pollFunc(sendHeartBeat, 60000, 10);
infinitePollFunc(sendHeartBeat, 10);

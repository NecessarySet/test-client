var protobuf = require('google-protobuf')
var stat = require('./status_pb')


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

var xmlns = "http://www.w3.org/2000/svg";
const svgWindow = document.createElementNS (xmlns, "svg"); 
svgWindow.setAttribute('width', '500px');
svgWindow.setAttribute('height', '300px');
svgWindow.setAttribute('version', '1.1');
svgWindow.setAttribute('class', 'graph');

const cpuR = document.createElementNS(xmlns, 'rect');
cpuR.setAttribute('width', '300px');
cpuR.setAttribute('height', '50px');
cpuR.setAttribute('x', '10px');
cpuR.setAttribute('y', '0px');
cpuR.setAttribute('style', 'fill:blue;stroke:pink;stroke-width:5;opacity:0.5');
cpuR.setAttribute('class', 'cpuRect');
svgWindow.appendChild(cpuR);

const cpuAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animate'); 
cpuAnim.setAttribute('class', 'cpuAnim');
cpuR.appendChild(cpuAnim);

const memR = document.createElementNS(xmlns, 'rect');
memR.setAttribute('width', '300px');
memR.setAttribute('height', '50px');
memR.setAttribute('x', '10px');
memR.setAttribute('y', '75px');
memR.setAttribute('style', 'fill:red;stroke:pink;stroke-width:5;opacity:0.5');
memR.setAttribute('class', 'memRect');
svgWindow.appendChild(memR);

const memAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animate'); 
memAnim.setAttribute('class', 'memAnim');
memR.appendChild(memAnim);

container.appendChild(card);
card.appendChild(h1);
card.appendChild(cpuP);
card.appendChild(memP);
card.appendChild(svgWindow);

container.appendChild(card)

function arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
}

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

	var request = new XMLHttpRequest();
	request.open('GET', 'http://192.168.3.211:6502/v1/api/data/status', true);

	//remove this line if dealing with JSON 
	//note value is case sensitive
	request.responseType = "arraybuffer";

	request.onload = function () {
		if (request.status >= 200 && request.status < 400) {

			// Note:  mixing DOM updates and <p> updates seems to cause
			// flashing
			// Accessing JSON data here
			var bytes = new Uint8Array(this.response);
			
			if(!bytes) {
				console.log("problem!");
				return; 
			}
			const update = stat.StatusUpdate.deserializeBinary(bytes);
			const cpu = update.getCpu();
			const mem = update.getMem();

			const cardheader = document.getElementsByClassName('cardheader')[0];
			//cardheader.extContent = `Reading ${(new Date()).getTime()}`;
			
			const cpuP = document.getElementsByClassName('cpuP')[0];
			//cpuP.textContent = `CPU: ${reading.CPU}`;

			const cpuAnim = document.getElementsByClassName('cpuAnim')[0];
			cpuAnim.setAttribute('attributeName', 'width'); //avoid issues with heights being negative and upper left corner origin
			cpuAnim.setAttribute('dur', '100ms');
			cpuAnim.setAttribute('from', cpuAnim.getAttribute('to'));
			cpuAnim.setAttribute('to', `${cpu*100}%`);
			cpuAnim.setAttribute('fill', 'freeze'); //needed to avoid flashing
			cpuAnim.setAttribute('repeatCount', 0);
			cpuAnim.beginElement();
			//cpuRect.setAttribute('height', `${reading.CPU*150}px`);
		
			const memP = document.getElementsByClassName('memP')[0];
			//memP.textContent = `Memory: ${reading.Memory}`;

			const memAnim = document.getElementsByClassName('memAnim')[0]; 
			memAnim.setAttribute('attributeName', 'width');
			memAnim.setAttribute('dur', '100ms');
			memAnim.setAttribute('from', memAnim.getAttribute('to'));
			memAnim.setAttribute('to', `${mem*100}%`);
			memAnim.setAttribute('fill', 'freeze');
			memAnim.setAttribute('repeatCount', 0);
			memAnim.beginElement();
			//memRect.setAttribute('height', `${reading.Memory*150}px`);
			//note 

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
infinitePollFunc(sendHeartBeat, 200);

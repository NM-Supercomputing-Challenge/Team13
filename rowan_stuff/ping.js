window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = null;
var isPlaying = false;
var sourceNode = null;
var analyser = null;
var theBuffer = null;
var DEBUGCANVAS = null;
var mediaStreamSource = null;
var pitch;
var listening = false;

window.onload = function() {
	audioContext = new AudioContext();
	MAX_SIZE = Math.max(4,Math.floor(audioContext.sampleRate/44100));
}

function error() {
    alert('Stream generation failed.');
}

function getUserMedia(dictionary, callback) {
    try {
        navigator.getUserMedia = 
        	navigator.getUserMedia ||
        	navigator.webkitGetUserMedia ||
        	navigator.mozGetUserMedia;
        navigator.getUserMedia(dictionary, callback, error);
    } catch (e) {
        alert('getUserMedia threw exception :' + e);
    }
}

function gotStream(stream) {
    // Create an AudioNode from the stream.
    mediaStreamSource = audioContext.createMediaStreamSource(stream);

    // Connect it to the destination.
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 4096;
	mediaStreamSource.connect( analyser );
	updateFrequency();
}


function reset() {

	if (isPlaying) {
        //stop playing and return
        sourceNode.stop( 0 );
        sourceNode = null;
        analyser = null;
		isPlaying = false;
		
	}
	
    sourceNode = audioContext.createOscillator();
    analyser = audioContext.createAnalyser();
	analyser.fftSize = 4096;
	sourceNode.frequency.value = 0;
    sourceNode.connect( analyser );
    analyser.connect( audioContext.destination );
	sourceNode.start(0);
	isPlaying = true;
	
	if (isPlaying) {
        //stop playing and return
        sourceNode.stop( 0 );
        sourceNode = null;
        analyser = null;
		isPlaying = false;
		
	}
	
	console.log("reset");
	
}

function start_mic() {
	reset();
    getUserMedia(
    	{
            "audio": {
                "mandatory": {
                    "googEchoCancellation": "false",
                    "googAutoGainControl": "false",
                    "googNoiseSuppression": "false",
                    "googHighpassFilter": "false"
                },
                "optional": []
            },
        }, gotStream);
}

var rafID = null;
var tracks = null;
var buflen = 1024;
var buf = new Float32Array( buflen );


var MIN_SAMPLES = 0;  // will be initialized when AudioContext is created.

function autoCorrelate( buf, sampleRate ) {
	var SIZE = buf.length;
	var MAX_SAMPLES = Math.floor(SIZE/2);
	var best_offset = -1;
	var best_correlation = 0;
	var rms = 0;
	var foundGoodCorrelation = false;
	var correlations = new Array(MAX_SAMPLES);

	for (var i=0;i<SIZE;i++) {
		var val = buf[i];
		rms += val*val;
	}
	rms = Math.sqrt(rms/SIZE);
	if (rms<0.01) // not enough signal
		return -1;

	var lastCorrelation=1;
	for (var offset = MIN_SAMPLES; offset < MAX_SAMPLES; offset++) {
		var correlation = 0;

		for (var i=0; i<MAX_SAMPLES; i++) {
			correlation += Math.abs((buf[i])-(buf[i+offset]));
		}
		correlation = 1 - (correlation/MAX_SAMPLES);
		correlations[offset] = correlation; // store it, for the tweaking we need to do below.
		if ((correlation>0.9) && (correlation > lastCorrelation)) {
			foundGoodCorrelation = true;
			if (correlation > best_correlation) {
				best_correlation = correlation;
				best_offset = offset;
			}
		} else if (foundGoodCorrelation) {
			// short-circuit - we found a good correlation, then a bad one, so we'd just be seeing copies from here.
			// Now we need to tweak the offset - by interpolating between the values to the left and right of the
			// best offset, and shifting it a bit.  This is complex, and HACKY in this code (happy to take PRs!) -
			// we need to do a curve fit on correlations[] around best_offset in order to better determine precise
			// (anti-aliased) offset.

			// we know best_offset >=1, 
			// since foundGoodCorrelation cannot go to true until the second pass (offset=1), and 
			// we can't drop into this clause until the following pass (else if).
			var shift = (correlations[best_offset+1] - correlations[best_offset-1])/correlations[best_offset];  
			return sampleRate/(best_offset+(8*shift));
		}
		lastCorrelation = correlation;
	}
	if (best_correlation > 0.01) {
		// console.log("f = " + sampleRate/best_offset + "Hz (rms: " + rms + " confidence: " + best_correlation + ")")
		return sampleRate/best_offset;
	}
	return -1;
//	var best_frequency = sampleRate/best_offset;
}

/*function beep(freq) {
	oscillator = audioContext.createOscillator();
	gainNode = audioContext.createGain();
	oscillator.connect(gainNode);
	
    gainNode.connect(audioContext.destination);
	gainNode.gain.value = 0.1;
    oscillator.frequency.value = freq;
    oscillator.type = 'sine';

    oscillator.start(1);
    oscillator.stop(1.50);
}
*/

/*function listen() {
	start_mic();
	//listening = true;
	updateFrequency();
}
*/


/*function ping_send() {

	start_mic();   //turn on mic
	listening = true;

	beep(3000);  //send ping
	t1 = performance.now();   //start timer
	updateFrequency(3000);  //start listening
	t2 = perfomance.now();   //stop timer 

	reset();
	
	distance = 0.343 * (t2-t1); 
	console.log(distance + " meters");   //print results

}
*/

/*function ping_return() {
	toggleLiveInput();   //turn on mic
	listening = true;
	while (listening){
		console.log(pitch);
		if (pitch > 3000 && pitch < 3500){ 
			reset();
			beep(4000);
			listening = false;
			console.log("ping returned!");
			break;
		}
	}
}*/


function updateFrequency(time) {

	var cycles = new Array;
	analyser.getFloatTimeDomainData( buf );
	var ac = autoCorrelate( buf, audioContext.sampleRate );

	if (ac == -1) {
		frequency = 0;
	} else {
		frequency = ac;
	}

	console.log(frequency);

/*	if (frequency > 3000 && frequency < 3500){
		listening = false;
		break;
	}
	*/


	rafID = window.requestAnimationFrame(updateFrequency);
	
}

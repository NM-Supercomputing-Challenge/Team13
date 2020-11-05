var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

var analyser = audioCtx.createAnalyser();

const source = audioCtx.createMediaElementSource(audio);
source.connect(analyser);


var dataArray = new Float32Array(analyser.frequencyBinCount); // Float32Array should be the same length as the frequencyBinCount

void analyser.getFloatFrequencyData(dataArray); // fill the Float32Array with data returned from getFloatFrequencyData()

console.log(dataArray);



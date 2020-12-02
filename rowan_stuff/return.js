

frequency = 5000;
duration = 200;
var i;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function beep_once() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var oscillator = audioCtx.createOscillator();
    var gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    gainNode.gain.value = 0.05;
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    oscillator.start();
  
    setTimeout(
      function(){
        oscillator.stop();
      }, 
      duration
    );  
};


async function beep() {

  var t_0 = performance.now();


for (i=0; i<5; i++){
  var t_0 = performance.now();
  await sleep(300);
  var t_1 = performance.now();

  console.log(t_1 - t_0);  
  beep_once();
  console.log(i);  
}

}


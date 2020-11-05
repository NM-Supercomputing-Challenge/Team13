audioCtx = new (window.AudioContext || window.webkitAudioContext)();

frequency = 3000;
type = 'sine';
volume = 0.05;
duration = 50;
var i;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function beep_once() {
    var oscillator = audioCtx.createOscillator();
    var gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    gainNode.gain.value = volume;
    oscillator.frequency.value = frequency;
    oscillator.type = type;

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
  await sleep(100);
  beep_once();
  console.log(i);  
}


  var t_1 = performance.now();

  console.log(t_1 - t_0);  
}


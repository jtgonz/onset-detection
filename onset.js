// load in sound, plot waveform (maybe using D3?)
// do onset detection

// constants
var SAMPLE_RATE = 44100;

// get AudioContext -- this is where the audio graph resides
var audioCtx = new (window.AudioContext || window.webkitAudioContext)

var canvasCtx;  // for drawing waveform

// buffer to hold amplitude values of sample
//var sample_seconds = 2;
//var buffer = audioCtx.createBuffer(1, SAMPLE_RATE*sample_seconds, SAMPLE_RATE)

/*
var analyser = audioCtx.createAnalyser();
analyser.fftSize = 2048;
var bufferLength = analyser.frequencyBinCount;
var dataArray = new Uint8Array(bufferLength);
*/

function loadSoundFromSource () {

  var sound_file = document.getElementById('input-field').value;

  // create an AudioBufferSourceNode
  var source = audioCtx.createBufferSource();
  console.log(source)

  var request = new XMLHttpRequest();

  request.open('GET', sound_file, true);
  request.responseType = 'arraybuffer';

  // this function is called whenever the state of the request changes
  request.onload = function () {

    // at this point, audioData is an array of raw binary data representing
    // the audio file. It needs to be decoded, right?
    var audioData = request.response;

    // asynchronusly decode audio file data contained in an arraybuffer
    audioCtx.decodeAudioData(audioData,

      // called on successful decoding
      function (buffer) {
        // store decoded arraybuffer in AudioBufferSourceNode
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.connect(analyser);
      },

      function (e) {
        console.log('there was promblem')
      }
    );
  }

  request.send();

  //source.start();
  //console.log(2);
  
  return false;
}

window.onload = function () {

  // get canvas context
  var canvas = document.getElementById('sample-waveform');
  var height = canvas.height - 1;

  canvasCtx = canvas.getContext('2d');
  canvasCtx.lineWidth = 1;
  canvasCtx.strokeStyle = '#FF0080'

  // fill buffer with nonsense
  var noise = new Float32Array(88200);
  for (var i = 0; i < 88200; i++) {
    noise[i] = Math.random() * 2 - 1;
  }

  drawWaveform(noise, height);

}

// draw waveform on canvas, sample every 256 points
function drawWaveform (array, height, scale) {
  var scale = 70 || scale;
  var mid = height / 2;

  canvasCtx.beginPath();

  // plot line proporational to avg amplitude, or 1px high if no data
  for (var i = 0; i < 135600; i += 256) {
    var y = array[i] ? mid - array[i] * scale + 0.5 : mid - 0.5;
    var x = i/256+0.5;

    canvasCtx.moveTo(x, y > mid ? mid - 1 : mid);
    canvasCtx.lineTo(x, y);
  }

  canvasCtx.stroke();
}

/*
// draw waveform on canvas
// Instead of just taking a sample every 256 elements, average over 256
// elements at a time and use that average. But this is kinda slow and might
// not be necessary
function drawWaveformFromAvg (array, height, scale) {

  var scale = 100 || scale;
  canvasCtx.beginPath();

  array.forEach( function (element, index) {
    // average amplitudes over 256 samples
    if (index % 256) return;

    var avg = array.slice(index, index+256).reduce( function (prev, next) {
      console.log(prev);
      return prev + next;
    }) / 256;

    // plot line proporational to avg amplitude
    var x = index/256, y = height / 2 - avg * scale;
    canvasCtx.moveTo(x, height / 2);
    canvasCtx.lineTo(x, y);
  });

  canvasCtx.stroke();
}
*/
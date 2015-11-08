// load in sound, plot waveform (maybe using D3?)
// do onset detection

// TODO: modify drawWaveform to automatically scale to max amplitude
// TODO: load ONLY first three-ish seconds of sample into AudioBufffer

// constants
var sample_rate = 44100;
var sample_secs = 3.5;  

// get AudioContext -- this is where the audio graph resides. Also, create
// three-and-a-half-second buffer to hold the sound
var audioCtx = new (window.AudioContext || window.webkitAudioContext);
var sound = audioCtx.createBuffer(2, sample_rate * sample_secs, sample_rate);
var amplitudes;

var canvas, canvasCtx;  // for drawing waveform
var canvasWave, canvasSpect;

var freqs;

// buffer to hold amplitude values of sample
//var sample_seconds = 2;}
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

  var request = new XMLHttpRequest();

  request.open('GET', sound_file, true);
  request.responseType = 'arraybuffer';

  // this function is called whenever the state of the request changes
  request.onload = function () {

    // audioData is an ArrayBuffer, and it has no format to speak of. The
    // individual bytes do NOT represent amplitude values. Needs to be decoded
    // In general, you can only see data in an ArrayBuffer via a data view
    var audioData = request.response;

    // asynchronusly decode audio file data contained in an arraybuffer
    audioCtx.decodeAudioData(audioData,

      // called on successful decoding. 'buffer' is an AudioBuffer. We can get
      // the data from each channel as a Float32Array by calling
      // buffer.getChannelData(channel). Each element of the returned array
      // represents an amplitude value at that point.
      function (buffer) {
        // get first three seconds of buffer
        var num_samples = sample_rate * sample_secs;
        sound.copyToChannel(buffer.getChannelData(0).slice(0, num_samples), 0);
        sound.copyToChannel(buffer.getChannelData(1).slice(0, num_samples), 1);

        amplitudes = sound.getChannelData(0);
        drawWaveform(amplitudes, canvas);

        console.log('about to do work');
        freqs = stft_magnitude(amplitudes);
        drawSpectrogram(freqs, canvasSpect);
      },

      function (e) {
        console.log('oh geez there was promblem')
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
  canvas = document.getElementById('sample-waveform');
  var height = canvas.height - 1;

  canvasSpect = document.getElementById('sample-spectrogram');

  canvasCtx = canvas.getContext('2d');
  canvasCtx.lineWidth = 1;
  canvasCtx.strokeStyle = '#FF8000'

  // fill buffer with nonsense
  var noise = new Float32Array(88200);
  for (var i = 0; i < 88200; i++) {
    noise[i] = Math.random() * 2 - 1;
  }

  //drawWaveform(noise, height);

}

// draw waveform on canvas, sample every 256 points
function drawWaveform (array, canvas) {
  var height = canvas.height - 1;
  var mid = height / 2;

  // scale based on largest amplitude value
  var abs = Math.abs;
  var scale = mid / array.reduce(function (prev, next, i) {
    if (i % 256) return prev;
    return abs(prev) > abs(next) ? prev : abs(next);
  });

  canvasCtx.beginPath();
  canvasCtx.moveTo(0, mid);

  // plot line proporational to avg amplitude, or 1px high if no data
  for (var i = 0; i < canvas.width * 256; i += 256) {
    var y = array[i] ? mid - array[i] * scale + 0.5 : mid - 0.5;
    var x = i/256+0.5;

    canvasCtx.lineTo(x, y > mid ? mid - 1 : mid);
    canvasCtx.lineTo(x, y);
  }

  canvasCtx.stroke();
}

// draw spectrogram
function drawSpectrogram (array, canvas, numbins) {
  var numbins = numbins || 32;
  var context = canvas.getContext('2d');

  // the color of the rectangle represents the normalized intensity of the
  // frequency. should we use log? eh maybe

  // get maximum and minimum values (might only need max, can modify this later)
  var maxmin = array.reduce( function (a, b, i) {
    if (i == 1) a = [Math.max(...a), Math.min(...a)];
    return [Math.max(a[0], Math.max(...b)), Math.min(a[1], Math.min(...b))]
  });
  //var [maxval, minval] = maxmin;
  var maxval = maxmin[0];
  var minval = maxmin[1];
  var rangeval = Math.log(maxval - minval); 

  // calculate bin size (number of frequencies per bin) and bin height (height
  // of each box in spectrogram)
  var binsize = Math.floor(array.length / numbins);
  var binheight = Math.floor(canvas.height / numbins);

  // calculate frame width (width of each box in spectrogram)
  var framewidth = canvas.width / array.length;
  console.log(canvas.width);
  console.log(array.length);
  console.log(framewidth);

  // draw a rectangle for every frequency bin for every frame
  array.forEach( function (n, i) {

    // get average magnitude in each frequency bin
    n_binned = xrange(numbins).map(
      a => n.slice(a*binsize, (a+1)*binsize).reduce((a,b) => a+b) / binsize );

    // draw rectangle so that color represents the magnitude of the frequency
    n_binned.forEach( function (k, j) {
      context.fillStyle = 'hsl(' +
        (255 - Math.floor(Math.log((k-minval))/rangeval*255)) +
        ', 100%, 50%)';
      context.fillRect(i*framewidth, (numbins-1-j)*binheight, Math.ceil(framewidth), binheight);
    });
  });

}
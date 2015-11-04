"use strict";

let tau = 2 * Math.PI;  // giving this a shot (http://tauday.com/tau-manifesto)

/* Generator function similar to Python xrange */
function* xrange (n) {
  let i = 0;
  while (i < n)
    yield i++;
}

/* Return an array of N equally spaced points around the unit cirlce */
function discrete_circle (N) {
  let W = [];
  for (let m of xrange(N)) {
    W[m] = [Math.cos(tau * m / N), Math.sin(tau * m / N)];
  }
  return W;
}

/* Complex multiplication and addtion */
function cpx_mult(a, b) {
  return [a[0]*b[0] - a[1]*b[1], a[0]*b[1] + a[1]*b[0]];
}
function cpx_add(a, b) {
  return [a[0]+b[0], a[1]+b[1]];
}
function cpx_sub(a, b) {
  return [a[0]-b[0], a[1]-b[1]];
}
function euclid_norm (a) {
  return Math.sqrt(a[0]*a[0] + a[1]*a[1]);
}
/* does this make sense?
let cpx_mult = (a, b) => [a[0]*b[0] - a[1]*b[1], a[0]*b[1] + a[1]*b[0]];
let cpx_add = (a, b) => [a[0]+b[0], a[1]+b[1]];
let l1_norm = (a, b) => Math.sqrt(a[0]*a[0] + a[1]*a[1]);
*/

/* Direct computation of Discrete Fourier Transform */
function dft_direct (re, im) {
  let N = re.length;
  if (N.toString(2) % 10) return; // check that N is a power of 2

  // array containing N evenly spaced points around the unit circle
  let W = discrete_circle(N);

  // initialize imaginary values to zero if not provided
  im = im || re.map( a => 0 );

  // sum (x * W) over N points (0 to N-1), for all frequencies k in N
  return re.map( (_, k) =>
         re.map( (_, n) => cpx_mult([re[n], im[n]], W[n * k % N]) )
           .reduce( (a, b) => cpx_add(a, b) ));
}

/* Get array of magnitudes from complex-valued array */
function get_magnitude (x) { return x.map( a => euclid_norm(a) ); }

/* Radix-2 Fast Fourier Transform (Cooley-Tukey algorithm) */
function fft_rx2 (re, im) {
  let N = re.length;
  if (N.toString(2) % 10) // return immediately if N is not power of 2
    return;
  else if (N <= 32)       // if N is sufficiently small, compute dft directly
    return dft_direct(re, im);

  let W = discrete_circle(N); // N evenly spaced points around the unit circle
  im = im || re.map( a => 0 ); // set imaginary values to zero if not provided

  // compute N/2-point DFT for even and odd samples of input array
  let s_1 = fft_rx2(...[re, im].map( a => a.filter( (_, i) => !(i % 2) ) ));
  let s_2 = fft_rx2(...[re, im].map( a => a.filter( (_, i) => i % 2 ) ));

  // for all frequencies k in N/2-1
  let X = [];
  for (let k of xrange(N/2)) {
    // mutiply by twiddle factor. then, exploit symmetry W[k+N/2] = -W[k]
    let g_2 = s_2.map( (a, n) => cpx_mult(a, W[n * k % N]) );
    X[k] = cpx_add(s_1[k], g_2[k]);
    X[k + N/2] = cpx_sub(s_1[k], g_2[k]);
  }

  return X;
}

function make_sample_sine_wave (k, N) {
  k = k || 10;
  N = N || 2048;
  
  let x = [];
  for (let i of xrange(N)) {
    x[i] = Math.sin(2*Math.PI*k*i/N);
  }

  return x;

/*
  numbers = [1, 2, 3, 4 ... N]
  numbers.map()

  return xrange(N).map( a => Math.sin(2*Math.PI*k*a/N) )
*/


}
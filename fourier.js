"use strict";

let tau = 2 * Math.PI;  // giving this a shot

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

  // why not generator comprehensions?
  // return [ [Math.cos(tau * m / N), Math.sin(tau * m / N)] for m of xrange(N) ]
}

/* Complex multiplication and addtion */
function cpx_mult(a, b) {
  return [a[0]*b[0] - a[1]*b[1], a[0]*b[1] + a[1]*b[0]];
}
function cpx_add(a, b) {
  return [a[0]+b[0], a[1]+b[1]];
}

/* Direct computation of Discrete Fourier Transform */
function dft_direct (re, im) {
  let N = re.length;
  if (N.toString(2) % 10) return; // check that N is a power of 2

  // array containing N evenly spaced points around the unit circle
  let W = discrete_circle(N);

  // initialize imaginary values to zero if not provided, zip arrays
  im = im || re.map( a => 0 );

  // sum (x * W) over N points (0 to N-1), for all frequencies k in N
  return re.map( (_, k) =>
         re.map( (_, n) => cpx_mult([re[n], im[n]], W[n * k % N]) )
           .reduce( (a,b) => cpx_add(a, b) ));
  
  // sum (x * W) over N points (0 to N-1), for all frequencies k
  /*
  // more verbose -- but maybe more readable?
  return re.map( function (_, k) {
    return re.map( function (_, n) {
      return cpx_mult([re[n], im[n]], W[n * k % N]);
    }).reduce( (a,b) => cpx_add(a, b) );
  });
  */

}
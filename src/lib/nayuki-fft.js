/*
 * Free FFT and convolution (JavaScript)
 *
 * Copyright (c) 2014 Project Nayuki
 * http://www.nayuki.io/page/free-small-fft-in-multiple-languages
 *
 * (MIT License)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 * - The above copyright notice and this permission notice shall be included in
 *   all copies or substantial portions of the Software.
 * - The Software is provided "as is", without warranty of any kind, express or
 *   implied, including but not limited to the warranties of merchantability,
 *   fitness for a particular purpose and noninfringement. In no event shall the
 *   authors or copyright holders be liable for any claim, damages or other
 *   liability, whether in an action of contract, tort or otherwise, arising from,
 *   out of or in connection with the Software or the use or other dealings in the
 *   Software.
 *
 * Slightly restructured by Chris Cannam, cannam@all-day-breakfast.com
 * Made NPM exportable and re-linted by caesarsol, cesare.soldini@gmail.com
 */

'use strict'

/**
 * Construct an object for calculating the discrete Fourier transform (DFT)
 * of size n, where n is a power of 2.
 * @param n {Number} Length of the signal arrays.
 */
function FFT(n) {
  this.n = n
  this.levels = -1
  var i

  for (i = 0; i < 32; i++) {
    if (1 << i === n) {
      this.levels = i  // Equal to log2(n)
    }
  }
  if (this.levels === -1) {
    throw new Error('Length is not a power of 2')
  }

  this.cosTable = new Array(n / 2)
  this.sinTable = new Array(n / 2)
  for (i = 0; i < n / 2; i++) {
    var x = 2 * Math.PI * i / n
    this.cosTable[i] = Math.cos(x)
    this.sinTable[i] = Math.sin(x)
  }

  /**
   * Computes the discrete Fourier transform (DFT) of the given vectors,
   * storing the result back into the vectors.
   * The vector's length must be equal to the size n that was passed to the
   * object constructor, and this must be a power of 2.
   * Uses the Cooley-Tukey decimation-in-time radix-2 algorithm.
   * @param real {Array<Number>} Real component of the signal
   * @param imag {Array<Number>} Imaginary component of the signal
   * The two arrays will be mutated to give the result.
   */
  this.forward = function (real, imag) {
    var n = this.n
    var i, j, k

    // Bit-reversed addressing permutation
    for (i = 0; i < n; i++) {
      j = reverseBits(i, this.levels)
      if (j > i) {
        // Swap 1
        k = real[i]
        real[i] = real[j]
        real[j] = k
        // Swap 2
        k = imag[i]
        imag[i] = imag[j]
        imag[j] = k
      }
    }

    // Cooley-Tukey decimation-in-time radix-2 FFT
    for (var size = 2; size <= n; size *= 2) {
      var halfsize = size / 2
      var tablestep = n / size
      for (i = 0; i < n; i += size) {
        for (j = i, k = 0; j < i + halfsize; j++, k += tablestep) {
          var tpre = real[j + halfsize] * this.cosTable[k] +
                      imag[j + halfsize] * this.sinTable[k]
          var tpim = -real[j + halfsize] * this.sinTable[k] +
                      imag[j + halfsize] * this.cosTable[k]
          real[j + halfsize] = real[j] - tpre
          imag[j + halfsize] = imag[j] - tpim
          real[j] += tpre
          imag[j] += tpim
        }
      }
    }
  }

  /*
   * Computes the inverse discrete Fourier transform (IDFT) of the given complex
   * vector, storing the result back into the vector.
   * The vector's length must be equal to the size n that was passed to the
   * object constructor, and this must be a power of 2.
   * This is a wrapper function.
   * This transform does not perform scaling, so the inverse is not a true inverse.
   */
  this.inverse = function (real, imag) {
    this.forward(imag, real)
  }
}

/*
 * Returns the integer whose value is the reverse of the lowest 'bits'
 * bits of the integer 'x'.
 */
function reverseBits(x, bits) {
  var y = 0
  for (var i = 0; i < bits; i++) {
    y = (y << 1) | (x & 1)
    x >>>= 1
  }
  return y
}

module.exports = FFT

import FFT from 'lib/nayuki-fft'

export default function frequencies(audioData, sampleRate) {
  const n = 1024 * 8 // maxPowerOfTwoIn(audioData.length)
  const fft = new FFT(n)
  const real = audioData.slice(0, n)
  const imag = Array(n).fill(0)
  fft.forward(real, imag)

  // For a Real input signal the second half of the FFT contain no useful additional information.
  const m = n / 2
  const freqData = Array(m)
  let maxAmp = 0
  let binAtMaxAmp = 0
  for (let k = 0; k < m; k++) {
    const amp = Math.sqrt(real[k] ** 2 + imag[k] ** 2)
    if (amp > maxAmp) {
      maxAmp = amp
      binAtMaxAmp = k
    }
    freqData[k] = amp
  }
  // Use freqBin to convert from k to the frequency: freq[k] = freqData.freqBin * k
  // Use maxAmp to normalize
  const freqBin = sampleRate / n
  const freqAtMaxAmp = binAtMaxAmp * freqBin

  return { freqData, freqBin, maxAmp, binAtMaxAmp, freqAtMaxAmp }
}

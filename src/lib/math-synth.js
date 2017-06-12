const context = new window.AudioContext()
const TWO_PI = 2 * Math.PI

function sinPi(x) { return Math.sin(x * TWO_PI) }
function clamp(x, [min, max]) { return Math.max(Math.min(x, max), min) }
function sig(x) { return x > 0 ? 1 : x < 0 ? -1 : 0 }
function zero(bool) { return bool ? 0 : 1 }
function abs(x) { return Math.abs(x) }

export const Osc = {
  sin(x) { return sinPi(x) },
  squ(x) { return sig(sinPi(x)) },       // amplitude 1
  sqn(x) { return sig(sinPi(x)) * 0.2 }, // amplitude ear-normalized
  saw(x) { return ((x + 0.25) % 1) * 2 - 1 },
  tri(x) { return abs(Osc.saw(x)) * 2 - 1 },
  noi(x) { return Math.random() },
}

export const Envl = {
  decay: (t, a, b, k, s = 1) => ((a / s) * b * k) / (b * k + (t - 0.002) * ((a / s) - b)) * s,
  lin: (t, a, b, k) => zero(t >= k) * (a + (b - a) * t % k / k),
  sin: (t, k) => sinPi(t / k / 2),
  sindecay: (t, ks, kd = ks, s = 1) => Envl.sin(t, ks) * Envl.decay(t, 1, 0.1, kd, s) * 4.4,
}

export function genBuffer(durationSeconds, genFn) {
  const bufferSize = context.sampleRate * durationSeconds
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i <= data.length; i++) {
    const t = i / context.sampleRate
    const datum = genFn(t)
    data[i] = clamp(datum, [-1, 1])
  }

  return buffer
}

function genNodeBuffer(buffer) {
  const node = context.createBufferSource()
  node.buffer = buffer
  node.connect(context.destination)
  return node
}

export function playBuffer(buffer) {
  const node = genNodeBuffer(buffer)
  node.start(0)
}

export function drawBufData(audioData, givenCanvas = null) {
  const canvas = givenCanvas || document.createElement('canvas')

  const w = canvas.width = audioData.length
  canvas.style.width = '100%'
  const h = canvas.height
  canvas.style.height = `${h}px`

  // console.log(`Rendering ${w} lines`)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = 'steelblue'
  ctx.globalAlpha = 0.4
  ctx.fillRect(0, 0, w, h)
  ctx.globalAlpha = 1.0
  for (let x = 0; x < w; x++) {
    const y = (audioData[x] / 2 + 0.5) * h
    ctx.fillRect(x, h - y - 1, 1, 2)
    ctx.globalAlpha = 0.3
    ctx.fillRect(x, h - y, 1, y)
    ctx.globalAlpha = 1.0
  }

  function fft(signal) { return Array(1024).fill(0).map((x, i) => Math.sin(x)) }
  const fourierData = fft(audioData)
  ctx.fillStyle = 'tomato'
  ctx.globalAlpha = 1.0
  for (let x = 0; x < fourierData.length; x++) {
    const y = fourierData[x] * h
    ctx.fillRect(x, h - y - 1, 1, 2)
    ctx.globalAlpha = 0.3
    ctx.fillRect(x, h - y, 1, y)
    ctx.globalAlpha = 1.0
  }

  if (!givenCanvas) document.body.appendChild(canvas)
  return canvas
}

export const Sounds = {
  a: t => Osc.sin(t * 440),
  laser: t => Osc.sin(Envl.decay(660, 10, t)),
  bird: t => Osc.sin(Envl.decay(660, 110, t)),
  laserOscA: t => Osc.sin(t * 440) * Osc.sin(1 / t),
}

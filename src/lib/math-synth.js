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
  sqn(x) { return sig(sinPi(x)) * 0.2 }, // amplitude normalized
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
    const RMP = 100
    // const ramp = i < RMP ? i / RMP : (data.length - i) < RMP ? (data.length - i) / RMP : 1
    const datum = genFn(t)
    data[i] = clamp(datum, [-1, 1])
  }

  return buffer
}

/*
const node = context.createScriptProcessor(1024, 1, 1);
node.onaudioprocess = function (e) {
  const output = e.outputBuffer.getChannelData(0);
  for (const i = 0; i < output.length; i++) {
    output[i] = Math.random();
  }
};
*/

function genNodeBuffer(buffer) {
  const node = context.createBufferSource()
  node.buffer = buffer
  node.connect(context.destination)
  return node
}

const playingNodes = new Map()
function playOrStop(buffer) {
  if (!playingNodes.has(buffer)) {
    const node = genNodeBuffer(buffer)
    playingNodes.set(buffer, node)
    node.start(0)
    return node
  } else {
    const node = playingNodes.get(buffer)
    playingNodes.delete(buffer)
    node.stop(0)
    return null
  }
}

export function playBuffer(buffer) {
  const node = genNodeBuffer(buffer)
  node.start(0)
}

// function analyseFft(node) {
//   const analyser = context.createAnalyser()
//   analyser.fftSize = 2048
//   analyser.minDecibels = -90
//   analyser.maxDecibels = -10
//   analyser.smoothingTimeConstant = 0.85
//
//   node.connect(analyser)
//
//   const data = new Uint8Array(analyser.frequencyBinCount)
//   analyser.getByteFrequencyData(data)
//   console.log(data.join())
//   // const normData = data.map(n => n / 255)
//   return data
// }

// let int
function drawPlayer(buffer, canvas = undefined) {
  drawBufData(buffer.getChannelData(0), canvas).addEventListener('click', () => {
    playBuffer(buffer)
    // const node = playOrStop(buffer)
    // if (node) {
    //   const canvas = document.createElement('canvas')
    //   int = window.setInterval(() => drawBufData(analyseFft(node), canvas), 500)
    // } else {
    //   window.clearInterval(int)
    // }
  })
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
  ctx.globalAlpha = 1
  for (let x = 0; x < w; x++) {
    const y = (audioData[x] / 2 + 0.5) * h
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

function drawPlayerBuffer(duration, genBufferFn, canvas) {
  const buffer = genBuffer(duration, genBufferFn)
  return drawPlayer(buffer, canvas)
}

// drawPlayerBuffer(0.5, Sounds.a)
// drawPlayerBuffer(0.5, Sounds.laser)
// drawPlayerBuffer(0.5, Sounds.bird)
// drawPlayerBuffer(0.05, t => Envl.decay(1, 0.0001, t))
// drawPlayerBuffer(0.5, t => 0.01 / (0.01 + t), 0.5)
// drawPlayerBuffer(0.5, Sounds.laserOscA)

// const can = document.createElement('canvas')
// const inp = document.createElement('input')
// inp.value = 'Osc.sin(Envl.decay(660, 10, t))'
// inp.style.width = '500px'
// function update() {
//   const fn = eval('t => ' + inp.value)
//   drawPlayerBuffer(0.5, fn, can)
// }
// inp.addEventListener('keyup', update)
// update()
// document.body.appendChild(inp)
// document.body.appendChild(can)

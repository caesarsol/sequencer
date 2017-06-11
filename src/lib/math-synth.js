const context = new window.AudioContext()

export const Osc = {
  sin(x) { return Math.sin(x * 2 * Math.PI) * 0.5 + 0.5 },
  clamp(x, [min, max]) { return Math.max(Math.min(x, max), min) },
}

export function genBuffer(durationSeconds, genFn) {
  const bufferSize = context.sampleRate * durationSeconds
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i <= data.length; i++) {
    const t = i / context.sampleRate
    const ramp = i < 100 ? i / 100 : (data.length - i) < 100 ? (data.length - i) / 100 : 1
    const datum = genFn(t) * ramp
    data[i] = Osc.clamp(datum, [0, 1])
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
  draw(buffer.getChannelData(0), canvas).addEventListener('click', () => {
    playBuffer(buffer)
    // const node = playOrStop(buffer)
    // if (node) {
    //   const canvas = document.createElement('canvas')
    //   int = window.setInterval(() => draw(analyseFft(node), canvas), 500)
    // } else {
    //   window.clearInterval(int)
    // }
  })
}

function draw(audioData, givenCanvas = null) {
  const canvas = givenCanvas || document.createElement('canvas')
  const w = canvas.width = audioData.length
  const h = canvas.height = 100
  canvas.style.width = '100%'
  canvas.style.height = '100px'
  const ctx = canvas.getContext('2d')

  console.log(`Rendering ${w} lines`)
  ctx.fillStyle = 'steelblue'
  ctx.globalAlpha = 0.4
  ctx.fillRect(0, 0, w, h)
  ctx.globalAlpha = 1
  for (let x = 0; x < w; x++) {
    const y = audioData[x] * h
    // setTimeout(() => ctx.fillRect(x, h - y, 1, y), 1)
    ctx.fillRect(x, h - y, 1, y)
  }

  if (!givenCanvas) document.body.appendChild(canvas)
  return canvas
}

export const Envl = {
  decay: (a, b, t) => a * b / (b + t * (a - b)),
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

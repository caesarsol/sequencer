/* eslint-disable react/jsx-no-bind */
import React from 'react'
import { observable, createTransformer } from 'mobx'
import { observer } from 'mobx-react'
import Sequencer from 'components/Sequencer'
import { genBuffer, playBuffer, drawBufData, Osc, Envl } from 'lib/math-synth'
import { getNoteFreq } from 'lib/notes'

// import Synth from 'lib/synth'
// const synth = new Synth()
// const play = chord => synth.playChord(chord)

const { sin, tri, sqn, saw, noi } = Osc
const { lin, decay, lindecay, sindecay } = Envl
const frq = getNoteFreq

const mathSounds = observable([
  [ 'sin', 0.2, t => sin(t * 440) ],
  [ 'tri', 0.2, t => tri(t * 440) ],
  [ 'squ', 0.2, t => sqn(t * 440) ],
  [ 'saw', 0.2, t => saw(t * 440) ],

  [ 'snare', 0.2, t => noi() * lin(t, 1, 0, 0.2) ],
  [ 'snare long', 0.4, t => noi() * lin(t, 1, 0, 0.4) * decay(t, 2, 0.01, 4) ],
  // [ '', 0.2, t => [1, 2, 3, 4, 5].reduce((acc, n) =>
  //   acc * squ(t * 440 * n)
  // , 1) * sindecay(t, 0.15) ],
  [ 'bell', 0.2, t => [[2.0, 1], [3.0, 2], [4.16, 3], [5.43, 4], [6.79, 5], [8.21, 6]].reduce((acc, [f, d]) =>
    acc + sin(t * 440 * f) * lin(t, 1 / d, 0, 0.2) / 6
  , 0) ],
  [ 'horgan', 0.4, t =>
    sin(t * frq('C3')) *
    sin(t * frq('E3')) *
    sin(t * frq('G3')) *
    sindecay(t, 0.4),
  ],
  // [ 'laser', 0.2, t => sin(50 / sin(t / 0.8)) * 0.9 ], FFT NOT WORKING??
  [ 'laser', 0.2, t => sin(decay(t, 660, 10, 1)) ],
  [ 'cip', 0.2, t => 0.5 * sin(decay(t, 660, 110, 1)) ],
  [ 'pulse', 0.2, t => sin(50 * sin(t / 0.8)) * 0.9 ],

  [ 'kick hi', 0.2, t => sin(decay(t, 220, 110, 1)) * lindecay(t, 0.2) ],
  [ 'kick mid', 0.2, t => sin(decay(t, 60, 10, 1)) * lindecay(t, 0.2) ],
  [ 'kick bass', 0.2, t => sin(decay(t, 70, 20, 1)) * lindecay(t, 0.2) ],
])

const genBufferLazy = createTransformer(([name, duration, equation]) => genBuffer(duration, equation))
const drawBufferLazy = createTransformer((sound) => drawBufData(genBufferLazy(sound).getChannelData(0)))

@observer
export default class App extends React.Component {
  render() {
    const bufferSounds = mathSounds.map(genBufferLazy)
    const play = chord => chord.forEach(s => playBuffer(bufferSounds[s]))

    return (
      <div className="flex flex-row">
        <Sequencer steps={8} instruments={mathSounds.length} play={play} />

        <div
          className="mt5 flex flex-column"
          onClick={({ currentTarget: t }) => {
            Array.from(t.querySelectorAll('canvas'))
              .forEach(c => { c.style.width = c.style.width ? '' : '100%' })
          }}
        >
          {mathSounds.map((sound, i) =>
            <div key={i} className="relative ma1 h2">
              <canvas
                height="32"
                ref={el => {
                  console.log(el)
                  if (el) drawBufferLazy(sound)
                }}
              />
              {/* <span className="absolute left-0 ma1 f4 black-70 code">
                {mathSounds[i][0]}
              </span> */}
              <input
                className="h-100 w-100 absolute left-0 bn f4 bg-transparent hover-bg-white-30 outline-0 black-70 code"
                value={mathSounds[i][2].toString().replace(/^t => /, '')}
                onChange={({ target: { value } }) => {
                  // eslint-disable-next-line no-eval
                  mathSounds[i][2] = eval(`t => ${value}`)
                }}
                onClick={(event) => { event.stopPropagation() }}
              />
            </div>
          )}
        </div>
      </div>
    )
  }
}

/* eslint-disable react/jsx-no-bind */
import React from 'react'
import Sequencer from 'components/Sequencer'
import { genBuffer, playBuffer, drawBufData, Osc, Envl } from 'lib/math-synth'
import { getNoteFreq } from 'lib/notes'

// import Synth from 'lib/synth'
// const synth = new Synth()
// const play = chord => synth.playChord(chord)

const mathSounds = [
  [ 'sin', 0.2, t => Osc.sin(t * 440) ],
  [ 'tri', 0.2, t => Osc.tri(t * 440) ],
  [ 'squ', 0.2, t => Osc.sqn(t * 440) ],
  [ 'saw', 0.2, t => Osc.saw(t * 440) ],

  [ 'snare', 0.2, t => Osc.noi() * Envl.lin(t, 1, 0, 0.2) ],
  [ 'snare long', 0.4, t => Osc.noi() * Envl.lin(t, 1, 0, 0.4) * Envl.decay(t, 2, 0.01, 4) ],
  // [ '', 0.2, t => [1, 2, 3, 4, 5].reduce((acc, n) =>
  //   acc * Osc.squ(t * 440 * n)
  // , 1) * Envl.sindecay(t, 0.15) ],
  [ 'bell', 0.2, t => [[2.0, 1], [3.0, 2], [4.16, 3], [5.43, 4], [6.79, 5], [8.21, 6]].reduce((acc, [f, d]) =>
    acc + Osc.sin(t * 440 * f) * Envl.lin(t, 1 / d, 0, 0.2) / 6
  , 0) ],
  [ 'horgan', 0.4, t =>
    Osc.sin(t * getNoteFreq('C3')) *
    Osc.sin(t * getNoteFreq('E3')) *
    Osc.sin(t * getNoteFreq('G3')) *
    Envl.sindecay(t, 0.4),
  ],
  // [ 'laser', 0.2, t => Osc.sin(50 / Osc.sin(t / 0.8)) * 0.9 ], FFT NOT WORKING??
  [ 'laser', 0.2, t => Osc.sin(Envl.decay(t, 660, 10, 1)) ],
  [ 'cip', 0.2, t => 0.5 * Osc.sin(Envl.decay(t, 660, 110, 1)) ],
  [ 'pulse', 0.2, t => Osc.sin(50 * Osc.sin(t / 0.8)) * 0.9 ],

  [ 'kick hi', 0.2, t => Osc.sin(Envl.decay(t, 220, 110, 1)) * Envl.lindecay(t, 0.2) ],
  [ 'kick mid', 0.2, t => Osc.sin(Envl.decay(t, 60, 10, 1)) * Envl.lindecay(t, 0.2) ],
  [ 'kick bass', 0.2, t => Osc.sin(Envl.decay(t, 70, 20, 1)) * Envl.lindecay(t, 0.2) ],
]

const bufferSounds = mathSounds.map(([name, duration, equation]) => genBuffer(duration, equation))

const play = chord => chord.forEach(i => playBuffer(bufferSounds[i]))

export default class App extends React.Component {
  render() {
    return (
      <div className="flex flex-row">
        <Sequencer steps={8} instruments={mathSounds.length} play={play} />

        <div
          className="mt5 flex flex-column"
          onClick={({ currentTarget: t }) => {
            Array.from(t.querySelectorAll('canvas')).forEach(c => { c.style.width = c.style.width ? '' : '100%' })
          }}
        >
          {bufferSounds.map((b, i) =>
            <div key={i} className="relative ma1 h2">
              <canvas
                height="32"
                ref={el => drawBufData(b.getChannelData(0), el)}
              />
              <span className="absolute left-0 ma1 f4 black-70 code">
                {mathSounds[i][0]}
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }
}

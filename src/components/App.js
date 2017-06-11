/* eslint-disable react/jsx-no-bind */
import React from 'react'
import Sequencer from 'components/Sequencer'
import { genBuffer, playBuffer, drawBufData, Osc, Envl } from 'lib/math-synth'
import { getNoteFreq } from 'lib/notes'

// import Synth from 'lib/synth'
// const synth = new Synth()
// const play = chord => synth.playChord(chord)

const buffers = [
  genBuffer(0.2, t => Osc.sin(t * 440)),
  genBuffer(0.2, t => Osc.tri(t * 440)),
  genBuffer(0.2, t => Osc.sqn(t * 440)),
  genBuffer(0.2, t => Osc.saw(t * 440)),
  genBuffer(0.2, t => Osc.noi() * Envl.lin(t, 1, 0, 0.2)),
  genBuffer(0.2, t => Osc.noi() * Envl.decay(t, 1, 0.01, 0.3, 10)),
  genBuffer(0.2, t => [1, 2, 3, 4, 5].reduce((acc, n) =>
    acc * Osc.squ(t * 440 * n)
  , 1) * Envl.sindecay(t, 0.15)),
  genBuffer(0.2, t => [[2.0, 1], [3.0, 2], [4.16, 3], [5.43, 4], [6.79, 5], [8.21, 6]].reduce((acc, [f, d]) =>
    acc * Osc.sin(t * 440 * f) * Envl.decay(t, 1, 0.01, 0.3, d)
  , 8)),
  genBuffer(0.2, t =>
    Osc.sin(t * getNoteFreq('C3')) * // Envl.decay(t, 1, 0.01, 0.3, 10) *
    Osc.sin(t * getNoteFreq('E3')) * // Envl.decay(t, 1, 0.01, 0.3, 10) *
    Osc.sin(t * getNoteFreq('G3')) * // Envl.decay(t, 1, 0.01, 0.3, 10) *
  1),
  [],
  genBuffer(0.2, t => Osc.sin(Envl.decay(t, 660, 110, 1))), // laser
  genBuffer(0.2, t => Osc.sin(Envl.decay(t, 660, 10, 1))),
  genBuffer(0.2, t => Osc.sin(Envl.decay(t, 60, 10, 1))),
  genBuffer(0.2, t => Osc.sin(Envl.decay(t, 70, 20, 1))),
  genBuffer(0.2, t => Osc.sin(Envl.decay(t, 220, 110, 1))),
  genBuffer(0.2, t => Osc.sin(440 * Osc.sin(t / 0.8)) * 0.9),
  genBuffer(0.2, t => Osc.sin(50 * Osc.sin(t / 0.8)) * 0.9),
  genBuffer(0.2, t => Osc.sin(50 / Osc.sin(t / 0.8)) * 0.9),
  genBuffer(0.2, t => Envl.sindecay(t, 0.2)),
]
const play = chord => chord.forEach(i => playBuffer(buffers[i]))

export default class App extends React.Component {
  render() {
    return (
      <div className="flex flex-row">
        <Sequencer steps={8} instruments={buffers.length} play={play} />
        <div className="mt5 flex flex-column">
          {buffers.map((b, i) =>
            <canvas
              key={i}
              className="ma1"
              height="32"
              ref={el => drawBufData(b.getChannelData(0), el)}
              onClick={ev => {
                ev.target.style.width = ev.target.style.width ? '' : '100%'
              }}
            />
          )}
        </div>
      </div>
    )
  }
}

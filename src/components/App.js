import React from 'react'
import Sequencer from 'components/Sequencer'
import { genBuffer, playBuffer, Osc, Envl, Sounds } from 'lib/math-synth'

// import Synth from 'lib/synth'
// const synth = new Synth()
// const play = chord => synth.playChord(chord, 4, 'sine')

const buffers = [
  genBuffer(0.2, t => Osc.sin(t * 1760)),
  genBuffer(0.2, t => Osc.sin(t * 880)),
  genBuffer(0.2, t => Osc.sin(t * 440)),
  genBuffer(0.2, t => Osc.sin(t * 220)),
  genBuffer(0.2, t => Osc.sin(t * 110)),

  genBuffer(0.2, t => Osc.sin(Envl.decay(660, 110, t))), // laser
  genBuffer(0.2, t => Osc.sin(Envl.decay(660, 10, t))),
  genBuffer(0.2, t => Osc.sin(Envl.decay(60, 10, t))),
  genBuffer(0.2, t => Osc.sin(Envl.decay(70, 20, t))),
  genBuffer(0.2, t => Osc.sin(Envl.decay(200, 100, t))),
]
const play = chord => chord.forEach(i => playBuffer(buffers[i]))

export default class App extends React.Component {
  render() {
    return (
      <div>
        <Sequencer steps={16} instruments={buffers.length} play={play} />
      </div>
    )
  }
}

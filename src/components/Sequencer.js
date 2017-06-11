import React from 'react'
import store from 'store/dist/store.modern'
import { get } from 'lodash'

function buildPads(steps, instruments, template = null) {
  const empty = Array(steps).fill(0).map(() => Array(instruments).fill(0))
  if (template === null) return empty
  empty.forEach((steps, s) => steps.forEach((_, i) => {
    empty[s][i] = get(template, [s, i], 0)
  }))
  return empty
}

function extractTargetValue(fn) {
  return (event) => fn(event.target.value)
}

function truesToIndexesReducer(acc, el, index) {
  if (el) acc.push(index)
  return acc
}

function Button({ active, className, ...props }) {
  const classes = [
    'w3 f5 pv1 ma1 ba bw2 outline-0',
    'bg-white hover-orange pointer',
    active ? 'orange b--orange' : 'dark-blue b--dark-blue',
    className,
  ].join(' ')
  return (
    <button
      className={classes}
      {...props}
    />
  )
}

export default class Sequencer extends React.Component {
  constructor(props) {
    super(props)

    const { steps, instruments } = this.props
    const pads = buildPads(steps, instruments, store.get('pads'))
    this.state = {
      pads,
      bpm: 120,
      step: -1,
      playing: store.get('playing'),
    }
  }

  componentDidMount() {
    if (this.state.playing) this.play()
  }

  play = () => {
    const { steps } = this.props
    this.interval = setInterval(() => {
      this.setState(({ step }) => ({
        playing: true,
        step: (step + 1) % steps,
      }), () => {
        store.set('playing', true)
        const { pads, step } = this.state
        const chord = pads[step].reduce(truesToIndexesReducer, [])
        this.props.play(chord)
      })
    }, 60000 / this.state.bpm / 2)
  }

  replay = () => {
    clearInterval(this.interval)
    this.play()
  }

  pause = () => {
    clearInterval(this.interval)
    store.set('playing', false)
    this.setState({
      playing: false,
      step: -1,
    })
  }

  togglePlay = () => {
    if (!this.state.playing) this.play()
    else this.pause()
  }

  reset = () => {
    const { steps, instruments } = this.props
    this.setState({
      pads: buildPads(steps, instruments),
    }, () => {
      this.togglePad(0, 0)
      this.togglePad(0, 0)
    })
  }

  setBpm = (bpm) => {
    this.setState({ bpm: Number(bpm) }, () => this.replay())
  }

  buildHandlerPad = (groupIndex, padIndex) => (event) => {
    if (event.metaKey) {
      this.props.play([padIndex])
    } else {
      this.togglePad(groupIndex, padIndex)
    }
  }

  togglePad = (groupIndex, padIndex) => {
    const pads = this.state.pads.slice(0)
    const padState = pads[groupIndex][padIndex]
    pads[groupIndex][padIndex] = padState === 1 ? 0 : 1
    this.setState({ pads })
    setTimeout(() =>
      store.set('pads', pads)
    , 1)
  }

  render() {
    const { pads, step } = this.state
    return (
      <div className="pa3">
        <div className="-controls flex">
          <Button
            active={this.state.playing}
            onClick={this.togglePlay}>
            Play
          </Button>

          <div className="ph2 pv1 ma1 f5 ba bw2 b--dark-blue dark-blue bg-white">
            <input className="w4" value={this.state.bpm} onChange={extractTargetValue(this.setBpm)} />
          </div>

          <Button onClick={this.reset}>
            Reset
          </Button>
        </div>

        <div className="-groups flex">
          {pads.map((group, groupIndex) =>
            <div key={groupIndex} className="-pads flex flex-column">
              {group.map((pad, padIndex) =>
                <div
                  key={padIndex}
                  className={`w2 h2 ma1 ${
                    pad === 1
                      ? (groupIndex === step ? 'bg-yellow' : 'bg-orange')
                      : (groupIndex === step ? 'bg-black-10' : 'bg-black-20')
                    }`}
                  onClick={this.buildHandlerPad(groupIndex, padIndex)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    )
  }
}

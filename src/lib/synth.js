import { getNotesForOctave } from 'lib/notes'
import buildAudio from 'lib/build-audio'

export default class Synth {
  constructor() {
    this.context = new window.AudioContext()
  }

  playFreq(frequency, when, duration, waveForm, gainLevel) {
    buildAudio(this.context, 'oscillator', {
      type: waveForm,
      frequency,
      start: when,
      stop: when + 2 * duration,
    }).connectBuild('gain', {
      gain: gain => {
        gain.value = 0
        gain.setTargetAtTime(gainLevel, when, 0.005)
        gain.setTargetAtTime(0, when + duration, 0.05)
      },
    }).out()
  }

  playFrequencies(frequencies, waveForm = 'sine') {
    const duration = 0.2
    const gainLevel = (waveForm === 'square' ? 0.15 : 1) / frequencies.length
    const now = this.context.currentTime
    frequencies.forEach(freq => this.playFreq(freq, now, duration, waveForm, gainLevel))
  }

  playChord(chord, octave, type) {
    const octaveFreqs = Object.values(getNotesForOctave(octave))
    const chordFreqs = chord.map(n => octaveFreqs[n])
    this.playFrequencies(chordFreqs, type)
  }
}

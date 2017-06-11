function capitalize(word) {
  return `${word[0].toUpperCase()}${word.slice(1)}`
}

const audioProto = {
  connect(to) {
    this.node.connect(to.node || to)
    return to
  },
  out() {
    this.connect(this.context.destination)
  },
  connectBuild(...a) {
    return this.connect(buildAudio(this.context, ...a))
  },
  do(fn) {
    fn(this.node)
    return this
  },
}

export default function buildAudio(context, nodeType, params = {}) {
  const node = context[`create${capitalize(nodeType)}`]()
  Object.keys(params).forEach(param => {
    const value = params[param]
    if (typeof node[param] === 'function') {
      node[param](value)
    } else if (node[param] instanceof window.AudioParam) {
      if (value instanceof window.AudioNode || value.node instanceof window.AudioNode) {
        value.connect(node[param])
      } else if (typeof value === 'function') {
        value(node[param])
      } else {
        node[param].value = value
      }
    } else {
      node[param] = value
    }
  })
  const audio = Object.create(audioProto, {
    nodeType: { value: nodeType },
    node: { value: node },
    context: { value: context },
  })
  return audio
}

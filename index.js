const cache = new Map()

const components = {}

export function get (node) {
  return cache.get(node)
}

export function add (index) {
  Object.assign(components, index)
}

export function mount (...types) {
  let nodes

  for (let i = 0; i < types.length; i++) {
    const attr = 'data-' + types[i]

    nodes = [].slice.call(document.querySelectorAll('[' + attr + ']'))

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      const name = node.getAttribute(attr)
      const component = components[name]

      if (component) {
        cache.set(node, component(node))
        node.removeAttribute(attr)
      }
    }
  }

  return nodes
}

export function unmount (nodes) {
  let unmounts = []

  nodes = [].concat(nodes || [])

  ;(nodes.length ? nodes : cache).forEach((value, key) => {
    if (typeof key !== 'number') value = key

    const { unmount } = cache.get(value) || {}

    if (!unmount) return

    unmounts.push(
      Promise.resolve(
        typeof unmount === 'function' ? (
          unmount(value)
        ) : (
          false
        )
      ).then(() => cache.delete(value))
    )
  })

  return Promise.all(unmounts)
}

const cache = new Map()

const components = {}

export function add (...args) {
  while (args.length) {
    Object.assign(components, args.pop())
  }
}

export function mount (...types) {
  let nodes

  for (let i = 0; i < types.length; i++) {
    const type = types[i]
    const attr = 'data-' + type
    nodes = [].slice.call(document.querySelectorAll('[' + attr + ']'))

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      const name = node.getAttribute(attr)
      const component = components[name]
      if (component) {
        const instance = component(node)
        cache.set(node, instance)
        node.removeAttribute(attr)
        if (instance.mount && typeof instance.mount === 'function') {
          instance.mount()
        }
      }
    }
  }

  return nodes
}

export function get (node) {
  return cache.get(node)
}

export function unmount (nodes) {
  if (nodes) {
    while (nodes.length) {
      cache.delete(nodes.pop())
    }
  } else {
    let unmounts = []

    cache.forEach((instance, key) => {
      if (instance.unmount) {
        if (typeof instance.unmount === 'function') {
          unmounts.push(instance.unmount())
        }
        cache.delete(key)
      }
    })

    return Promise.all(unmounts)
  }
}

export default {
  add,
  mount,
  unmount,
  get
}

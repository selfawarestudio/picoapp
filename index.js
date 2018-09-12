import createStore from 'picostate'

function createContext (node, actions, store) {
  return {
    node,
    actions,
    hydrate: store.hydrate,
    get state () {
      return store.state
    }
  }
}

export function component (create) {
  return function initialize (node, actions, store) {
    const instance = create(createContext(node, actions, store)) || {}

    instance.onStateChange && store.listen(instance.onStateChange)

    return instance
  }
}

export default function picoapp (components = {}, state, rawActions = {}) {
  let cache = []

  const store = createStore(state || {})

  const actions = Object.keys(rawActions).reduce((a, key) => {
    a[key] = val => store.hydrate(rawActions[key](val))
    return a
  }, {})

  return {
    actions,
    hydrate: store.hydrate,
    get state () {
      return store.state
    },
    add (index) {
      Object.assign(components, index)
    },
    mount (attrs = 'data-component') {
      attrs = [].concat(attrs)

      for (let a = 0; a < attrs.length; a++) {
        const attr = attrs[a]
        const nodes = [].slice.call(document.querySelectorAll('[' + attr + ']'))

        while (nodes.length) {
          const node = nodes.pop()
          const module = node.getAttribute(attr)
          const component = components[module]

          if (component) {
            // so can't be bound twice
            node.removeAttribute(attr)

            let instance

            try {
              instance = component(node, actions, store)
            } catch (e) {
              console.error(`picoapp - ${module} failed - ${e.message || e}`)
            }

            instance && cache.push(instance)
          }
        }
      }
    },
    unmount () {
      return Promise.all(
        // fire unmounts
        cache.filter(({ onUnmount }) => onUnmount)
          .map(({ node, onUnmount }) => {
            return Promise.resolve(
              typeof onUnmount === 'function' ? (
                onUnmount(createContext(node, actions, store))
              ) : null
            )
          })
      ).then(() => {
        // clear cache
        cache = cache
          .filter(({ onUnmount }) => !onUnmount)
          .filter(({ node }) => !document.documentElement.contains(node))
      })
    }
  }
}

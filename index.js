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
    a[key] = val => {
      return Promise.resolve(
        rawActions[key](val)(store.state)
      ).then(s => {
        return store.hydrate(s)()
      })
    }
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
          const modules = node.getAttribute(attr).split(/\s/)

          for (let m = 0; m < modules.length; m++) {
            const component = components[modules[m]]

            if (component) {
              node.removeAttribute(attr) // so can't be bound twice

              try {
                cache.push(component(node, actions, store))
              } catch (e) {
                console.error(`picoapp - ${modules[m]} failed - ${e.message || e}`, e.stack)
              }
            }
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

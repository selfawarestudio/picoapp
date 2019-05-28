import { create } from 'evx'

export function component (create) {
  return function initialize (node, context) {
    return {
      unmount: create(node, context),
      node
    }
  }
}

export function picoapp (components = {}, initialState = {}) {
  const evx = create(initialState)

  let cache = []

  return {
    on: evx.on,
    emit: evx.emit,
    getState () {
      return evx.getState()
    },
    add (index) {
      if (typeof index !== 'object') console.error(new Error(`picoapp - add should be passed an object of components`))
      Object.assign(components, index)
    },
    hydrate (data) {
      if (typeof data !== 'object') console.error(new Error(`picoapp - hydrate should be passed a state object`))
      return evx.hydrate(data)
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
                cache.push(component(node, evx))
              } catch (e) {
                console.groupCollapsed(`🚨 %cpicoapp - ${modules[m]} failed - ${e.message || e}`, 'color: red')
                console.error(e)
                console.groupEnd()
              }
            }
          }
        }
      }
    },
    unmount () {
      for (let i = cache.length - 1; i > -1; i--) {
        const { unmount, node } = cache[i]

        if (unmount || !document.documentElement.contains(node)) {
          unmount && unmount(node)
          cache.splice(i, 1)
        }
      }
    }
  }
}

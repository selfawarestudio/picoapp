function isObj (v) {
  return typeof v === 'object' && !Array.isArray(v)
}

export function component (create) {
  return function initialize (node, context) {
    return {
      unmount: create(node, context),
      node
    }
  }
}

export function picoapp (components = {}, initialState = {}) {
  let cache = []

  let state = initialState

  const events = {}

  function emit (ev, s) {
    return (events[ev] || []).map(fn => fn(s))
  }

  function on (ev, fn) {
    events[ev] = (events[ev] || []).concat(fn)
    return () => events[ev].slice(events[ev].indexOf(fn), 1)
  }

  const context = {
    on,
    emit (ev, data) {
      data = typeof data === 'function' ? data(state) : data

      state = Object.assign({}, state, isObj(data) ? data : {
        [ev]: data
      })

      emit(ev, (state = s))
    },
    get state () {
      return state
    }
  }

  return {
    on,
    emit: context.emit,
    get state () {
      return state
    },
    add (index) {
      Object.assign(components, index)
    },
    hydrate (data) {
      if (!isObj(data)) console.error(new Error(`picoapp - hydrate should be passed a state object`))
      state = Object.assign({}, state, data)
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
                cache.push(component(node, context))
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

import { create } from 'evx'

const isObj = v => typeof v === 'object' && !Array.isArray(v)
const isFn = v => typeof v === 'function'

// make sure evx and picoapp don't destroy the same events
export function component (create) {
  return function initialize (node, ctx) {
    let subs = []
    return {
      subs,
      unmount: create(node, {
        ...ctx,
        on: (evs, fn) => {
          const u = ctx.on(evs, fn)
          subs.push(u)
          return u
        }
      }),
      node
    }
  }
}

export function picoapp (components = {}, initialState = {}, plugins = []) {
  const evx = create(initialState)

  let cache = []

  return {
    on: evx.on,
    emit: evx.emit,
    getState () {
      return evx.getState()
    },
    add (index) {
      if (!isObj(index)) throw 'components should be an object'
      Object.assign(components, index)
    },
    use (fn) {
      if (!isFn(fn)) throw 'plugins should be a function'
      plugins.push(fn);
    },
    hydrate (data) {
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
            const comp = components[modules[m]]

            if (comp) {
              node.removeAttribute(attr) // so can't be bound twice

              try {
                const ext = plugins.reduce((res, fn) => {
                  const obj = fn(node)
                  return isObj(obj) ? Object.assign(res, obj) : res
                }, {})
                const instance = comp(node, {...ext, ...evx})
                isFn(instance.unmount) && cache.push(instance)
              } catch (e) {
                console.log(`🚨 %cpicoapp - ${modules[m]} failed - ${e.message || e}`, 'color: #E85867')
                console.error(e)
              }
            }
          }
        }
      }
    },
    unmount () {
      for (let i = cache.length - 1; i > -1; i--) {
        const { unmount, node, subs } = cache[i]

        unmount(node)
        subs.map(u => u())
        cache.splice(i, 1)
      }
    }
  }
}

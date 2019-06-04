import test from 'ava'
import { picoapp, component } from './dist/picoapp.js'

test('init', t => {
  const app = picoapp({ foo: 'foo' }, { bar: true })

  t.truthy(app.on)
  t.truthy(app.emit)
  t.truthy(app.getState)
  t.truthy(app.add)
  t.truthy(app.hydrate)
  t.truthy(app.hydrate({}))
  t.truthy(app.mount)
  t.truthy(app.unmount)

  t.is(app.getState().bar, true)
})
test('events', t => {
  const app = picoapp({ foo: 'foo' }, { bar: true })

  t.plan(5)

  app.on('a', () => t.truthy(1))
  app.on(['a', 'b'], () => t.truthy(1))
  app.on('*', () => t.truthy(1))
  app.emit('a')
  app.emit('b')
})
test('mount', t => {
  t.plan(1)

  const node = {
    getAttribute () {
      return 'foo'
    },
    removeAttribute () {}
  }

  global.document = {
    querySelectorAll () {
      return [ node ]
    },
    documentElement: {
      contains () {
        return false
      }
    }
  }

  const app = picoapp({
    foo: component((node, ctx) => {
      const u = ctx.on('foo', () => {
        t.pass()
        u() // unsub itself
      })
    })
  }, { bar: true })

  app.mount()

  app.emit('foo')

  app.unmount()

  app.emit('foo')
})

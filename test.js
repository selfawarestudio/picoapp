import test from 'ava'
import { picoapp, component } from './dist/picoapp.js'

const createNode = attr => ({
  getAttribute () {
    return attr
  },
  removeAttribute () {}
})

global.document = {
  querySelectorAll () {
    return [
      createNode('foo'),
      createNode('bar')
    ]
  },
}

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
test('mount', async t => {
  t.plan(2)

  const createComponent = () => {
    return component((node, ctx) => {
      const u = ctx.on('foo', () => {
        t.pass()
        u() // unsub itself
      })
    })
  }

  const app = picoapp({
    foo: createComponent(),
    bar: Promise.resolve(createComponent()) // async component
  }, { bar: true })

  await app.mount()

  app.emit('foo')

  app.unmount()

  app.emit('foo')
})
test('unmount', async t => {
  t.plan(4)
  
  const app = picoapp({
    foo: component((node, ctx) => {
      ctx.on('foo', () => t.truthy(1))
      return () => t.truthy(1)
    }),
    bar: component((node, ctx) => {
      ctx.on('foo', () => t.truthy(1))
    })
  })

  await app.mount()
  
  app.emit('foo')
  
  app.unmount()
  
  app.emit('foo')
})
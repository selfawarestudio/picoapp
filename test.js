import test from 'ava'
import { picoapp } from './dist/picoapp.js'

test('init', t => {
  const app = picoapp({ foo: 'foo' }, { bar: true })

  t.truthy(app.on)
  t.truthy(app.emit)
  t.truthy(app.getState)
  t.truthy(app.add)
  t.truthy(app.hydrate)
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

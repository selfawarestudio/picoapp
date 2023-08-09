import { describe, it, expect, vi } from 'vitest'
import picoapp from '../src/index'

it('should return a component function', () => {
  const app = picoapp()
  expect(app.component).toBeDefined()
})

it('should return a store object', () => {
  const app = picoapp()
  expect(app.on).toBeDefined()
  expect(app.emit).toBeDefined()
  expect(app.set).toBeDefined()
  expect(app.get).toBeDefined()
})

describe('store', () => {
  const app = picoapp({ state: { foo: 'bar' } })

  it('should have initial state', () => {
    expect(app.get().foo).toBe('bar')
  })

  it('should update state with set', () => {
    const handler = vi.fn()
    app.on('*', handler)

    app.set({ foo: 'baz' })
    expect(app.get().foo).toBe('baz')

    app.set({ foo: 'bar' })()
    expect(handler).toHaveBeenLastCalledWith({ foo: 'bar' }, undefined)
  })

  it('should update state with emit', () => {
    app.emit('*', { foo: 'bar' })
    expect(app.get().foo).toBe('bar')

    app.emit('*', prevState => ({ ...prevState, foo: 'baz' }))
    expect(app.get().foo).toBe('baz')
  })

  const handler = vi.fn()
  const off = app.on('b', handler)

  it('should broadcast events with state and transient data', () => {
    app.emit('b', { foo: 'baz' }, 'transient data')
    expect(handler).toHaveBeenLastCalledWith({ foo: 'baz' }, 'transient data')
  })

  it('should unsubscribe with off', () => {
    off()
    app.emit('b', { foo: 'bar' })
    expect(handler).toHaveBeenCalledOnce()
  })
})

describe('component', () => {
  const elA = document.createElement('x-a')
  document.body.append(elA)

  const disconnect = vi.fn()
  const connect = vi.fn(() => disconnect)

  const app = picoapp({
    state: {
      foo: 'bar',
    },
    components: [
      {
        'x-a': connect,
        'x-b': connect,
      },
    ],
  })

  app.component('x-c', connect)

  const elB = document.createElement('x-b')
  const elC = document.createElement('x-c')

  elC.innerHTML = `<ul @ref="list">
    <li @ref="items">1</li>
    <li @ref="items">2</li>
    <li @ref="items">3</li>
  </ul>`

  document.body.append(elB, elC)

  it('should run when added to dom', () => {
    expect(connect).toHaveBeenCalledTimes(3)
  })

  it('should receive refs and store', () => {
    const { component, ...store } = app

    expect(connect).toHaveBeenLastCalledWith(
      {
        root: elC,
        list: elC.querySelector('ul'),
        items: Array.from(elC.querySelectorAll('li')),
      },
      store,
    )
  })

  it('should run disconnect when removed from dom', () => {
    elC.remove()
    expect(disconnect).toHaveBeenCalledOnce()
  })

  const buttonConnect = vi.fn()
  const clickHandler = vi.fn()
  const storeHandler = vi.fn()
  const resizeHandler = vi.fn()

  app.component('x-button', ({ root }, { on }) => {
    buttonConnect()
    on(root, 'click', clickHandler)
    on('storeEvent', storeHandler)
    on(['resize', 'baz'], resizeHandler)
  })

  const button = document.createElement('button', { is: 'x-button' })
  button.textContent = `Click me`
  document.body.append(button)

  it('should create a button element if button is included in the name', () => {
    expect(button instanceof HTMLButtonElement).toBe(true)
    expect(buttonConnect).toHaveBeenCalledOnce()
  })

  it('should run events when fired', () => {
    button.click()
    expect(clickHandler).toHaveBeenCalledOnce()

    app.emit('storeEvent')
    expect(storeHandler).toHaveBeenCalledOnce()
  })

  it('should cleanup events when removed from dom', () => {
    button.remove()

    button.click()
    expect(clickHandler).toHaveBeenCalledOnce()

    app.emit('storeEvent')
    expect(storeHandler).toHaveBeenCalledOnce()
  })

  it('should run resize on connect', () => {
    expect(resizeHandler).toHaveBeenCalledOnce()

    document.body.append(button)

    expect(resizeHandler).toHaveBeenCalledTimes(2)
  })
})

import { each, on as marthaOn, noop } from 'martha'
import { createStore } from './store'

type PicoContextEntry = {
  element: HTMLElement
  subscriptions: (() => any)[]
  running: boolean
}

export type PicoRefs = {
  root: HTMLElement
  [name: string]: HTMLElement | HTMLElement[]
}

export type PicoStore = {
  on: any
  emit: any
  set: any
  get: any
}

export type PicoComponentDisconnect = void | (() => any)

export type PicoComponentConnect = (
  refs: PicoRefs,
  store: PicoStore,
) => PicoComponentDisconnect

export type PicoComponent = (
  name: string,
  connect: PicoComponentConnect,
  options?: { extends: string },
) => void

type Options = {
  state?: Record<string, any>
  components?: ((component: PicoComponent) => void)[]
}

export default function picoapp({ state = {}, components = [] }: Options = {}) {
  const internalStore = createStore(state)

  const context: PicoContextEntry[] = []

  const store: PicoStore = {
    ...internalStore,
    on,
  }

  if (components.length > 0) {
    components.map(componentFactory => componentFactory(component))
  }

  return {
    component,
    ...store,
  }

  function on(
    events: string | string[],
    handler: (state: any, data: any) => any,
  ): () => any

  function on(
    domEventTarget: EventTarget,
    domEventType: string,
    domEventHandler: EventListenerOrEventListenerObject,
    domEventHandlerOptions?: boolean | AddEventListenerOptions,
  ): () => any

  function on(...args: any[]) {
    let unsubscribe = noop
    let firstArg = args[0]

    if (
      typeof firstArg === 'string' ||
      (Array.isArray(firstArg) && firstArg.every(e => typeof e === 'string'))
    ) {
      const [events, handler] = args

      unsubscribe = internalStore.on(events, handler)

      if (
        Array.isArray(events) ? events.includes('resize') : events === 'resize'
      ) {
        handler(internalStore.get())
      }
    } else {
      const [
        domEventTarget,
        domEventType,
        domEventHandler,
        domEventHandlerOptions,
      ] = args

      unsubscribe = marthaOn(
        domEventTarget,
        domEventType,
        domEventHandler,
        domEventHandlerOptions,
      )
    }

    const entry = context[context.length - 1]

    if (entry && entry.running) {
      entry.subscriptions.push(unsubscribe)
    }

    return unsubscribe
  }

  function component(
    name: string,
    connect: PicoComponentConnect,
    options: { extends?: string } = {},
  ) {
    const ElementConstructor = options.extends
      ? (document.createElement(options.extends)
          .constructor as typeof HTMLElement)
      : HTMLElement

    customElements.define(
      name,
      class Component extends ElementConstructor {
        constructor() {
          super()
        }

        disconnect: PicoComponentDisconnect = noop

        connectedCallback() {
          context.push({
            element: this,
            subscriptions: [],
            running: true,
          })

          const refs: PicoRefs = { root: this }

          walk(
            this,
            (el, next, first) => {
              if (el.hasAttributes()) {
                for (const { name, value } of el.attributes) {
                  if (name === '@ref' && !first) {
                    const existingValue = refs[value]
                    refs[value] = existingValue
                      ? Array.isArray(existingValue)
                        ? existingValue.concat(el)
                        : [existingValue, el]
                      : el
                  }
                }
              }

              next()
            },
            true,
          )

          this.disconnect = connect(refs, store)

          const entry = context[context.length - 1]
          if (entry.subscriptions.length) {
            context[context.length - 1].running = false
          } else {
            context.pop()
          }
        }

        disconnectedCallback() {
          const entry = context.find(entry => entry.element === this)

          if (entry) {
            each(entry.subscriptions, unsubscribe => unsubscribe())
          }

          this.disconnect?.()
        }
      },
      options,
    )
  }
}

function walk(
  el: HTMLElement,
  callback: (el: HTMLElement, next: () => void, first: boolean) => void,
  first: boolean = false,
) {
  callback(
    el,
    () => {
      let node = el.firstElementChild as HTMLElement
      while (node) {
        walk(node, callback)
        node = node.nextElementSibling as HTMLElement
      }
    },
    first,
  )
}

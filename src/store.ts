type Handler = (state: {}, transient: any) => void
type State = Record<string, any>
type EventMap = Record<string, Handler[]>

function fire(
  eventNames: string[],
  eventMap: EventMap,
  state: State,
  transient?: any,
) {
  return Array.from(new Set(eventNames))
    .reduce<Handler[]>((fns, ev) => fns.concat(eventMap[ev] || []), [])
    .map(fn => fn(state, transient))
}

export function createStore(state: State = {}) {
  const eventMap: EventMap = {}

  return {
    get() {
      return Object.assign({}, state)
    },
    set(s: State) {
      Object.assign(state, s)

      return () => {
        const eventNames = ['*'].concat(Object.keys(s))
        fire(eventNames, eventMap, state)
      }
    },
    on(eventNames: string | string[], fn: Handler) {
      const _eventNames = ([] as string[]).concat(eventNames)
      _eventNames.map(ev => (eventMap[ev] = (eventMap[ev] || []).concat(fn)))
      return () =>
        _eventNames.map(ev => eventMap[ev].splice(eventMap[ev].indexOf(fn), 1))
    },
    emit(
      ev: string | string[],
      data: (s: State) => State | null,
      transient?: any,
    ) {
      let eventNames = (ev === '*' ? [] : ['*']).concat(ev)

      if (data) {
        const stateUpdate: State | null | undefined =
          typeof data === 'function' ? data(state) : data

        if (stateUpdate) {
          Object.assign(state, stateUpdate)
          eventNames = eventNames.concat(Object.keys(stateUpdate))
        }
      }

      fire(eventNames, eventMap, state, transient)
    },
  }
}

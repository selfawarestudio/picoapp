# picoapp
🐣 Tiny no-framework component toolkit. **800b gzipped.**

> tl;dr - this library automatically instantiates JavaScript modules on specific
> DOM elements in a website if they exist on the page. This is helpful for
> projects like Shopify or Wordpress that aren't using a framework like React or
> Vue. `picoapp` also contains functionality that make it a great companion to
> any PJAX library – like
> [operator](https://github.com/estrattonbailey/operator) – where page
> transitions can make conventional JS patterns cumbersome.

## Install
```
npm i picoapp --save
```

# Usage
Define data attributes on the DOM nodes you need to bind to:
```html
<button data-component='button'>I've been clicked 0 times</button>
```

Create a corresponding component:
```javascript
// button.js
import { component } from 'picoapp'

export default component((node, ctx) => {
  let count = 0

  node.onclick = () => {
    node.innerHTML = `I've been clicked ${++count} times`
  }
})
```

Import your component and create a `picoapp` instance:
```javascript
import { picoapp } from 'picoapp'
import button from './button.js'

const app = picoapp({ button })
```

To bind your component to the DOM node, call `mount()`:
```javascript
app.mount()
```

## State & Events
`picoapp` uses a very simple concept of state, which is shared and updated using
events or `hydrate` helpers. Internally, picoapp uses
[evx](https://github.com/estrattonbailey/evx), so check that library out for
more info.

You can define initial state:
```javascript
const app = picoapp({ button }, { count: 0 })
```

And consume it on the `context` object passed to your `component`:
```javascript
export default component((node, ctx) => {
  // ctx.getState().count
})
```

To interact with state, you will primarily use events. Passing an `object` when
emitting an event will *merge* that object into the global `state`. Event
listeners are then passed the entire `state` object for consumption.
```javascript
export default component((node, ctx) => {
  ctx.on('incremenent', state => {
    node.innerHTML = `I've been clicked ${state.count} times`
  })

  node.onclick = () => {
    ctx.emit('increment', { count: ctx.getState().count + 1 })
  }
})
```

You can also pass a function to an emitter in order to reference the previous
state:
```javascript
ctx.emit('increment', state => {
  return {
    count: state.count + 1
  }
})
```

Just like [evx](https://github.com/estrattonbailey/evx), `picoapp` supports
multi-subscribe and wildcard events as well:
```javascript
ctx.on([ 'count', 'otherProp' ], state => {}) // fires on `count` & `someProp`
ctx.on('*', state => {}) // fires on all state updates
```

If you need to update state, but don't need to fire an event, you can use
`ctx.hydrate`:
```javascript
export default component((node, ctx) => {
  ctx.hydrate({ count: 12 })
})
```

Additionally, you can add arbitrary state to the global `state` object directly:
```javascript
app.hydrate({ count: 5 })
```

And then access it from anywhere:
```javascript
app.getState() // { count: 5 }
```

## Un-mounting
`picoapp` components are instantiated as soon as they're found in the DOM after
calling `mount()`. Sometimes you'll also need to *un-mount* a component, say to
destroy a slideshow or global event listener after an AJAX page transition.

To do so, return a function from your component:
```javascript
import { component } from 'picoapp'

export default component((node, ctx) => {
  ctx.on('incremenent', state => {
    node.innerHTML = `I've been clicked ${state.count} times`
  })

  function handler (e) {
    ctx.emit('increment', { count: ctx.getState().count + 1 })
  }

  node.addEventListener('click', handler)

  return (node) => {
    node.removeEventListener('click', handler)
  }
})
```

And then, call `unmount()`. If the component no longer exists in the DOM, its
`unmount` handler will be called.
```javascript
app.unmount()
```

`unmount()` is synchronous, so given a PJAX library like
[operator](https://github.com/estrattonbailey/operator), you can do this *after*
every route transition:
```javascript
router.on('after', state => {
  app.unmount() // cleanup
  app.mount() // init new components
})
```

## Other Stuff
The `picoapp` instance also has access to the event bus:
```javascript
app.emit('event', { data: 'global' })
app.on('event', state => {})
```

If you need to add components – maybe asynchronously – you can use `add`:
```javascript
app.add({
  lazyImage: component(context => {})
})
```

If `data-component` isn't your style, or you'd like to use different types of
"components", pass your attributes to `mount()`:

Given the below, `picoapp` will scan the DOM for both `data-component` and
`data-util` attributes and init their corresponding JS modules:
```javascript
app.mount([
  'data-component',
  'data-util'
])
```

## License
MIT License © [Eric Bailey](https://estrattonbailey.com)

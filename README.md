# picoapp

🐣 Tiny no-framework component toolkit. **900b gzipped.**

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
<button data-component="button">I've been clicked 0 times</button>
```

Create a corresponding component:

```javascript
// button.js
import { component } from "picoapp";

export default component((node, ctx) => {
  let count = 0;

  node.onclick = () => {
    node.innerHTML = `I've been clicked ${++count} times`;
  };
});
```

Import your component and create a `picoapp` instance:

```javascript
import { picoapp } from "picoapp";
import button from "./button.js";

const app = picoapp({ button });
```

To bind your component to the DOM node, call `mount()`:

```javascript
app.mount();
```

## State & Events

`picoapp` uses a very simple concept of state, which is shared and updated using
events or `hydrate` helpers. Internally, picoapp uses
[evx](https://github.com/estrattonbailey/evx), so check that library out for
more info.

You can define initial state:

```javascript
const app = picoapp({ button }, { count: 0 });
```

And consume it on the `context` object passed to your `component`:

```javascript
export default component((node, ctx) => {
  // ctx.getState().count
});
```

To interact with state, you will primarily use events. Passing an `object` when
emitting an event will _merge_ that object into the global `state`. Event
listeners are then passed the entire `state` object for consumption.

```javascript
export default component((node, ctx) => {
  ctx.on("incremenent", state => {
    node.innerHTML = `I've been clicked ${state.count} times`;
  });

  node.onclick = () => {
    ctx.emit("increment", { count: ctx.getState().count + 1 });
  };
});
```

You can also pass a function to an emitter in order to reference the previous
state:

```javascript
ctx.emit("increment", state => {
  return {
    count: state.count + 1
  };
});
```

Just like [evx](https://github.com/estrattonbailey/evx), `picoapp` supports
multi-subscribe, wildcard, and property keyed events as well:

```javascript
ctx.on(["count", "otherProp"], state => {}); // fires on `count` & `otherProp`
ctx.on("*", state => {}); // fires on all state updates
ctx.on("someProp", ({ someProp }) => {}); // fires on all someProp updates
```

If you need to update state, but don't need to fire an event, you can use
`ctx.hydrate`:

```javascript
export default component((node, ctx) => {
  ctx.hydrate({ count: 12 });
});
```

#### Other Events
`picoapp` has a few protected events:
- `mount` - called after all components have mounted
- `unmount` - called after all unmountable components have unmounted
- `error` - called if a component throws an error

#### Errors

If an instance throws an error while mounting, it will be caught by `picoapp`.
To listen and process errors, subscribe to the `error` event:

```js
app.on("error", ({ error }) => {
  // do something with error
});
```

## Un-mounting

`picoapp` components are instantiated as soon as they're found in the DOM after
calling `mount()`. Sometimes you'll also need to _un-mount_ a component, say to
destroy a slideshow or global event listener after an AJAX page transition.

To do so, return a function from your component:

```javascript
import { component } from "picoapp";

export default component((node, ctx) => {
  ctx.on("incremenent", state => {
    node.innerHTML = `I've been clicked ${state.count} times`;
  });

  function handler(e) {
    ctx.emit("increment", { count: ctx.getState().count + 1 });
  }

  node.addEventListener("click", handler);

  return node => {
    node.removeEventListener("click", handler);
  };
});
```

And then, call `unmount()`. All [evx](https://github.com/estrattonbailey/evx) event subscriptions within your component will be destroyed automatically.

```javascript
app.unmount();
```

`unmount()` is also synchronous, so given a PJAX library like
[operator](https://github.com/estrattonbailey/operator), you can do this _after_
every route transition:

```javascript
router.on("after", state => {
  app.unmount(); // cleanup
  app.mount(); // init new components
});
```

If your component does not define an `unmount` handler, the component will remain mounted after calling `unmount` (including all [evx](https://github.com/estrattonbailey/evx) event subscriptions within the component). This is useful for components that persist across AJAX page transitions such as global navigation or even a WebGL canvas.

## Other Stuff

The `picoapp` instance also has access to state and the event bus:

```javascript
app.emit("event", { data: "global" });
app.on("event", state => {});
```

So you can add arbitrary state to the global `state` object directly:

```javascript
app.hydrate({ count: 5 });
```

And then access it from anywhere:

```javascript
app.getState(); // { count: 5 }
```

If you need to add components – maybe asynchronously – you can use `add`:

```javascript
app.add({
  lazyImage: component(context => {})
});
```

If `data-component` isn't your style, or you'd like to use different types of
"components", pass your attributes to `mount()`:

Given the below, `picoapp` will scan the DOM for both `data-component` and
`data-util` attributes and init their corresponding JS modules:

```javascript
app.mount(["data-component", "data-util"]);
```

## Plugins

The `picoapp` instance allows you to extend the component API through plugins. Plugins are functions that return objects, which then get merged into the `context` object passed to your `component`. Note that name conflicts with plugin properties will always be overriden by [picoapp's context](#state-&-events).

To define plugins, pass a function to the `use` method. The example below adds a `props` object extracted from the component node's `data-props` attribute:
```javascript
app.use(node => {
  const props = JSON.parse(node.dataset.props || '{}')
  return {props}
})
```

And then acccess plugin extensions from your component:
```javascript
const foo = component(node, ctx) => {
  const { images = [] } = ctx.props
  console.log(`start preloading ${images.length} images...`)
})
```

## License

MIT License © [Eric Bailey](https://estrattonbailey.com)

# picoapp
🐣 Tiny no-framework component toolkit. **800 bytes gzipped.**

## Install
```
npm i picoapp --save
```

# Usage
Configure your app with components. State and actions are totally optional.
```javascript
import picoapp, { component } from 'picoapp'

const components = {
  counter: component(({ node, state }) => {
    node.value = state.count

    return {
      onStateChange (state) {
        node.value = state.count
      }
    }
  }),
  inc: component(({ node, actions }) => {
    node.onclick = actions.inc
  }),
  dec: component(({ node, actions }) => {
    node.onclick = actions.dec
  })
}

const state = {
  count: 0
}

const actions = {
  inc: val => state => ({ count: state.count + 1 }),
  dec: val => state => ({ count: state.count - 1 })
}

const app = picoapp(components, state, actions)
```
Write HTML. By default, `picoapp` queries the DOM for `data-component`
attributes, but you can change this.
```html
<input type='number' data-component='counter' />
<button data-component='inc'>Inc</button>
<button data-component='dec'>Dec</button>
```
Mount all components to application.
```javascript
app.mount()
```

## Other Stuff
State updates are handled via
[picostate](https://github.com/estrattonbailey/picostate), so those methods are
inherited directly.
```javascript
app.hydrate({ count: 5 })

app.hydrate({ count: 3 })()

app.state // { count: 3 }
```
You can fire actions from the `app` instance as well.
```javascript
app.actions.inc()
```
If you need to add additional components, maybe asynchronously, you can use
`add`.
```javascript
app.add({
  lazyImage: component(context => {})
})
```
You can garbage collect old components between page transitions using `unmount`.
```javascript
app.unmount()
```
If you define `onUnmount` methods on components, you can perform clean up the DOM
or perform leave animations by returning `Promise`s and resolving when the
animation is complete.
```javascript
app.add({
  slideshow: component(({ node }) => {
    const slider = new Slider(node)

    return {
      onUnmount () {
        slider.destroy()
      }
    }
  })
})

app.unmount() // slider destroyed
```

## License
MIT License © [Eric Bailey](https://estrattonbailey.com)

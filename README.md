# picoapp
Teeny tiny components. Teeny tiny hassle. Teeny tiny size: **450 bytes
gzipped.**

## Install
```
npm i picoapp --save
```

# Usage
`picoapp` queries the DOM for configurable data-attributes, executing named
modules. It also keeps a register of instantiated modules for later reference.

First, define a module, `sayHello`.
```javascript
import app from 'picoapp'

function sayHello (button) {
  button.addEventListener('click', e => {
    alert('Hello!')
  })
}
```
Then the markup.
```html
<button data-component='sayHello'>Say Hello</button>
```
Then add the module so that it's available to `picoapp`.
```javascript
app.add({ sayHello })
```
And mount all `data-component`s.
```javascript
app.mount('component')
```

### Counter Example
```javascript
import app from 'picoapp'

function Counter (node) {
  let count = 0

  function render () {
    node.innerHTML = count
  }

  return {
    inc () {
      count++
      render()
    },
    mount () {
      render()
    }
  }
}

function IncrementCount (el) {
  const node = document.querySelector(el.getAttribute('data-target'))
  const counter = app.get(node) // get instance by DOM node

  el.addEventListener('click', e => {
    counter.inc()
  })
}

app.add({
  counter: Counter,
  inc: IncrementCount
})

app.mount('component', 'helper')
```
```html
<div>
  <div id='counter' data-component='counter'></div>
  <button data-helper='inc' data-target='#counter'>Increment</button>
</div>
```

## License
MIT License © [Eric Bailey](https://estrattonbailey.com)

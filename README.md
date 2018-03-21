# picoapp
Teeny tiny components. Teeny tiny hassle. Teeny tiny size: **450 bytes
gzipped.**

## Install
```
npm i picoapp
```

# Usage
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
  const counter = app.get(node)

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
...
  <div>
    <div id='counter' data-component='counter'></div>
    <button data-helper='inc' data-target='#counter'>Increment</button>
  </div>
...
```

## License
MIT License © [Eric Bailey](https://estrattonbailey.com)

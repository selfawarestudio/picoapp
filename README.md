# picoapp
🐣 Tiny no-framework component toolkit. **400 bytes gzipped.**

## Install
```
npm i picoapp --save
```

# Usage
Create an index of components.
```javascript
import * as app from 'picoapp'

app.add({
  counter (div) {
    let i = 0

    const [ plus, minus ] = [].slice.call(div.getElementsByTagName('button'))
    const input = div.getElementsByTagName('input')[0]

    function inc = () => {
      input.value = ++i
    }
    function dec = () => {
      input.value = --i
    }

    plus.onclick = inc
    minus.onclick = dec

    return {
      inc,
      dec
    }
  }
})
```
Mount the `counter` function to any DOM nodes with `data-component='counter'`
attributes defined.
```javascript
app.mount('component')
```
Like the markup below:
```html
<div id='counter' data-component='counter'>
  <button>+</button>
  <button>-</button>
  <input type='number' value='0' />
</div>
```
But you can name your attributes however you like, for instance:
```javascript
app.mount('util')
```
and:
```html
<div id='counter' data-util='counter'>
  ...
</div>
```
Up to you.

## API
Once mounted, you can do more, like get an existing component by its DOM node.
```javascript
import { get } from 'picoapp'

const counter = get(document.getElementById('counter'))

counter.inc()
```
You can add more components to the registry:
```javascript
import { add } from 'picoapp'

add({
  beep (node) {
    node.beep = true
  }
})
```
And continue instantiating using whatever data attributes you like:
```javascript
import { mount } from 'picoapp'

mount('boop')
```
For components that should be unmounted between pages, you can define an
`unmount()` method:
```javascript
import { add } from 'picoapp'

add({
  slider (div) {
    const slideshow = new slider(div)

    return {
      unmount () {
        slideshow.destroy()
      }
    }
  }
})
```
And unmount it using its DOM node, perhaps after an AJAX page transition:
```javascript
import { unmount } from 'picoapp'

unmount(document.getElementById('slider'))
```
If you want to unmount anything with an `unmount()` method, you can do that too:
```javascript
unmount()
```
`picoapp.unmount()` also returns a `Promise`, in case that's helpful to you:
```javascript
unmount().then(() => console.log('Everything is gone'))
```


## License
MIT License © [Eric Bailey](https://estrattonbailey.com)

electron-ipc-stream
===================

Duplex stream that run over [Electron's IPC](https://github.com/atom/electron/tree/master/docs) mechanism.


Why?
---

This allows you to use any Node.js stream readable/writable and easily communicate between your
main/renderer process.

Since your `renderer` process is also responsible for UI/DOM, etc, you may not want to do any heavy
processing on the renderer process. You could leverage this module to have the renderer stream
data to the `main` process for processing and then the `main` module could stream results
back to the `renderer` process for consumption.


Install
-------

    npm i --save electron-ipc-stream


Usage
-----

### Example 1: Pipe file from main process to renderer.

**main.js:**

```js
var app = require('app')
var fs = require('fs')
var path = require('path')
var window = require('electron-window')
var IPCStream = require('electron-ipc-stream')

app.on('ready', function () {
  var win = window.createWindow({ height: 600, with: 1000 })

  var ipcs = new IPCStream('any-arbitrary-channel-name', win)
  win.showUrl(path.resolve(__dirname, './index.html'), function () {
    // window is visible, dom is ready in window
    fs.createReadStream('/tmp/mainfile').pipe(ipcs)
  })
})
```

**rend.js:**

```js
var fs = require('fs')
var ipc = require('ipc')
var IPCStream = require('electron-ipc-stream')
var ipcs = new IPCStream('any-arbitrary-channel-name')

document.addEventListener('DOMContentLoaded', function () {
  ipcs.pipe(fs.createWriteStream('/tmp/rendfile')).on('finish', function () {
    console.log('done')
  })
})
```


### Example 2: Pipe file from renderer process to main.

**main.js:**

```js
var app = require('app')
var fs = require('fs')
var path = require('path')
var window = require('electron-window')
var IPCStream = require('electron-ipc-stream')

var tmpfile = '/tmp/mainfile'
app.on('ready', function () {
  var win = window.createWindow({ height: 600, with: 1000 })
  var ipcs = new IPCStream('any-arbitrary-channel-name', win)
  ipcs.pipe(fs.createWriteStream(tmpfile)).on('finish', function () {
    console.log('done')
  })
  win.showUrl(path.resolve(__dirname, './index.html'), function () { })
})
```

**rend.js:**

```js
var crypt = require('crypto') // notice this is 'crypt' and not 'crypto'
var fs = require('fs')
var ipc = require('ipc')
var IPCStream = require('electron-ipc-stream')
var ipcs = new IPCStream('any-arbitrary-channel-name')

fs.writeFileSync('/tmp/rendfile', crypt.randomBytes(10000))
document.addEventListener('DOMContentLoaded', function () {
  fs.createReadStream(tmpfile).pipe(ipcs)
})
```


API
----

### Main Process

#### IPCStream(channel, [browserWindow], [streamOptions])

Create a new IPCStream in the `main` process.


### Renderer Process

#### IPCStream(channel, [streamOptions])

Create a new IPCStream in the `renderer` process.


### Stream Options

You shouldn't have to mess with `objectMode`. Under the hood, `objectMode` is `true`.
Buffers are serialized to JSON. This is because of the way that Electron handles buffers
in renderer. See: https://github.com/atom/electron/blob/master/docs/api/remote.md for
more detail. You also may need to adjust [`highWaterMark`](https://nodejs.org/api/stream.html).


### JSON Objects

It is completely safe to call `write` on either end of the stream with objects.

source:

```js
myStream.write({name: 'JP'})
```

dest:

```js
// streams 1 (flowing):
myStream.on('data', function (data) {
  console.dir(data) // => {name: 'JP'}
})

// streams 2/3 (pull, if you prefer):
myStream.on('readable', function () {
  var data
  while (null !=== (data = myStream.read())) {
    console.dir(data) // => {name: 'JP'}
  }
})

```



### Examples

In the `./test` folder, you'll see two examples. You can run these by
installing [electron-prebuilt](https://www.npmjs.com/package/electron-prebuilt):

    npm i -g electron-prebuilt
    electron ./test/main-to-rend
    electron ./test/rend-to-main



License
-------

MIT Copyright [JP Richardson](https://github.com/jprichardson)

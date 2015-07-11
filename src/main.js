var bufferJson = require('buffer-json')
var Duplex = require('stream').Duplex
var ipc = require('ipc')
var util = require('util')

function MainIPCStream (channel, browserWindow, streamOpts) {
  if (!(this instanceof MainIPCStream)) {
    return new MainIPCStream(channel, browserWindow, streamOpts)
  }
  streamOpts = streamOpts || {}
  streamOpts.objectMode = streamOpts.objectMode ? streamOpts.objectMode : true

  this.browserWindow = browserWindow
  this.channel = channel

  var self = this
  function ipcCallback (event, data) {
    if (typeof data === 'string') {
      data = JSON.parse(data, bufferJson.reviver)
    }
    self.push(data)
  }
  ipc.on(this.channel, ipcCallback)

  this.on('finish', function () {
    if (this.browserWindow) this.browserWindow.webContents.send(this.channel + '-finish')
    delete ipc[this.channel]
  })

  ipc.once(this.channel + '-finish', function () {
    self.push(null)
  })

  Duplex.call(this, streamOpts)
}
util.inherits(MainIPCStream, Duplex)

MainIPCStream.prototype._read = function () { }

MainIPCStream.prototype._write = function (data, enc, next) {
  if (typeof data === 'string') {
    data = JSON.stringify(data)
  }
  if (Buffer.isBuffer(data)) {
    data = JSON.stringify(data, null, bufferJson.replacer)
  }
  if (!this.browserWindow) return console.warn('MainIPCStream: trying to write when no browserWindow is set.')
  this.browserWindow.webContents.send(this.channel, data)
  next()
}

module.exports = MainIPCStream

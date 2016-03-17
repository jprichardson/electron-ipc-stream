var bufferJson = require('buffer-json')
var Duplex = require('stream').Duplex
var ipcRenderer = require('ipc-renderer')
var util = require('util')

function RendIPCStream (channel, streamOpts) {
  if (!(this instanceof RendIPCStream)) {
    return new RendIPCStream(channel, streamOpts)
  }
  streamOpts = streamOpts || {}
  streamOpts.objectMode = streamOpts.objectMode ? streamOpts.objectMode : true

  this.channel = channel


  var self = this
  function ipcCallback (event, data) {
    if (typeof data === 'string') {
      data = JSON.parse(data, bufferJson.reviver)
    }
    self.push(data)
  }
  ipcRenderer.on(this.channel, ipcCallback)

  this.on('finish', function () {
    ipcRenderer.send(this.channel + '-finish')
    ipcRenderer.removeListener(this.channel, ipcCallback)
  })

  ipcRenderer.once(this.channel + '-finish', function () {
    self.push(null)
  })

  Duplex.call(this, streamOpts)
}
util.inherits(RendIPCStream, Duplex)

RendIPCStream.prototype._read = function () { }

RendIPCStream.prototype._write = function (data, enc, next) {
  if (typeof data === 'string') {
    data = JSON.stringify(data)
  }
  if (Buffer.isBuffer(data)) {
    data = JSON.stringify(data, null, bufferJson.replacer)
  }

  ipcRenderer.send(this.channel, data)
  next()
}

module.exports = RendIPCStream

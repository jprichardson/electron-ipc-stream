var bufferJson = require('buffer-json')
var Duplex = require('stream').Duplex
var ipc = require('ipc')
var util = require('util')

function RendIPCStream (channel, streamOpts) {
  if (!(this instanceof RendIPCStream)) {
    return new RendIPCStream(channel, streamOpts)
  }
  streamOpts = streamOpts || {}
  streamOpts.objectMode = streamOpts.objectMode ? streamOpts.objectMode : true

  this.channel = channel

  var self = this
  function ipcCallback (data) {
    if (typeof data === 'string') {
      data = JSON.parse(data, bufferJson.reviver)
    }
    self.push(data)
  }
  ipc.on(this.channel, ipcCallback)

  this.on('finish', function () {
    ipc.send(this.channel + '-finish')
    delete this[channel]
  })

  ipc.once(this.channel + '-finish', function () {
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

  ipc.send(this.channel, data)
  next()
}

module.exports = RendIPCStream

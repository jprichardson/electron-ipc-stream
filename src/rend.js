const bufferJson = require('buffer-json')
const Duplex = require('stream').Duplex
const ipcRenderer = require('electron').ipcRenderer
const util = require('util')

function RendIPCStream (channel, streamOpts) {
  if (!(this instanceof RendIPCStream)) {
    return new RendIPCStream(channel, streamOpts)
  }
  streamOpts = streamOpts || {}
  streamOpts.objectMode = streamOpts.objectMode ? streamOpts.objectMode : true

  this.channel = channel

  const ipcCallback = (event, data) => {
    if (typeof data === 'string') {
      data = JSON.parse(data, bufferJson.reviver)
    }
    this.push(data)
  }
  ipcRenderer.on(this.channel, ipcCallback)

  this.on('finish', function () {
    ipcRenderer.send(this.channel + '-finish')
    ipcRenderer.removeListener(this.channel, ipcCallback)
  })
  ipcRenderer.once(this.channel + '-finish', () => this.push(null))

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

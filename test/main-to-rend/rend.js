var fs = require('fs')
var ipc = require('ipc')
var IPCStream = require('../../')
var ipcs = new IPCStream('file')

var tmpfile = '/tmp/ipc-rend'

window.oneror = function (a, b, c, d, e) {
  console.error(e)
  console.error(e.stack)
}

document.addEventListener('DOMContentLoaded', function () {
  ipcs.pipe(fs.createWriteStream(tmpfile)).on('finish', function () {
    ipc.send('done')
  })
})

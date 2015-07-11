var crypt = require('crypto')
var fs = require('fs')
var ipc = require('ipc')
var IPCStream = require('../../')
var ipcs = new IPCStream('file')

var buffer = crypt.randomBytes(10000)
var tmpfile = '/tmp/ipc-rend'
fs.writeFileSync(tmpfile, buffer)

window.oneror = function (a, b, c, d, e) {
  console.error(e)
  console.error(e.stack)
}

document.addEventListener('DOMContentLoaded', function () {
  fs.createReadStream(tmpfile).pipe(ipcs)
})

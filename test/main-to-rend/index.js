var app = require('app')
var assert = require('assert')
var crypto = require('crypto')
var fs = require('fs')
var ipc = require('ipc')
var path = require('path')
var window = require('electron-window')
var IPCStream = require('../../')

var buffer = crypto.randomBytes(10000)
var tmpfile = '/tmp/ipc-main'
fs.writeFileSync(tmpfile, buffer)

process.on('uncaughtException', function (err) {
  console.error(err)
  console.error(err.stack)
  app.quit()
})

ipc.on('done', function () {
  var mainHash = md5File('/tmp/ipc-main')
  var rendHash = md5File('/tmp/ipc-rend')
  assert.strictEqual(mainHash, rendHash)

  console.log('')
  console.log('  success: ' + mainHash)
  console.log('')

  app.quit()
})

app.on('ready', function () {
  var win = window.createWindow({ height: 600, with: 1000 })

  var ipcs = new IPCStream('file', win)
  win._loadUrlWithArgs(path.resolve(__dirname, './index.html'), {}, function () {
    fs.createReadStream(tmpfile).pipe(ipcs)
  })
})

function md5File (file) {
  var data = fs.readFileSync(file)
  return crypto.createHash('md5').update(data).digest('hex')
}

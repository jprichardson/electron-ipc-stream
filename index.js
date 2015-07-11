var isRenderer = require('is-electron-renderer')

if (isRenderer) {
  module.exports = require('./src/rend')
} else {
  module.exports = require('./src/main')
}

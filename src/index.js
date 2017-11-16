// Client component
var MasqClient = require('./client.js')

var hubURL = 'http://localhost:8080'

var storage = new MasqClient(hubURL)

var setKeys = function () {
  return storage.set('key1', 'foo').then(function () {
    return storage.set('key2', 'bar')
  })
}
storage.onConnect()
.then(setKeys)
.then(function () {
  return storage.get('key1')
}).then(function (res) {
  console.log(res) // 'foo'
})['catch'](function (err) {
  console.log(err)
})

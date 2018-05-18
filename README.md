# Masq Client

[![](https://img.shields.io/badge/project-Masq-7C4DFF.svg?style=flat-square)](https://github.com/QwantResearch/masq-client)
[![](https://api.travis-ci.org/QwantResearch/masq-client.svg)](https://travis-ci.org/QwantResearch/masq-client)

![Masq Logo](https://i.imgur.com/qZ3dq0Q.png)

Promise-based client library for Qwant Masq. It allows applications to connect to the [Masq App](https://github.com/QwantResearch/masq-app) (central data manager) to store and retrieve application data.

# Install

## Developer

```
git clone https://github.com/QwantResearch/masq-client.git
cd client
npm install
```

# Example usage
Install the package using npm:

```bash
npm install --save git+https://github.com/QwantResearch/masq-client.git
```


Using the client library in your app:

```JavaScript
import MasqClient from 'masq-client'

// Define the Masq App socket URL (where the data will be persisted)
var settings = {
  socketUrl: 'ws://localhost:8080'
}

// Initialize the store
var masqStore = new MasqClient.Client(settings)
```

**NOTE:** You can find a fully working example in the [https://github.com/QwantResearch/masq-demos](search demo app).

# API

## Initialize the client

```JavaScript
var settings = {}
// first check if we have previously stored an authz token (more info below in the app registration)
var token = window.localStorage.getItem('token')
if (token) {
  settings['authToken'] = token
}

var client = new Client(settings)

// create a callback function that is called when an update is received from the server (typically following a sync event)
var pushCallback = function(msg) {
  // update your local app data
}

// finally init the WebSocket client that connects to the store
client.initWS(pushCallback).then(function () {
  // you can start using the client
})
```

## Register an App

Before being able to use Masq to store application data, an application has to register itself with the Masq App in order to receive an *authorization* token.

List of parameters:

  * `url`: URL of the app to be registered
  * `name`: name of the app
  * `desc`: description of the app
  * `icon`: URL of an icon for the app
  
```JavaScript
var regParams = {
  url: 'http://example.org',
  name: 'Example app',
  desc: 'A generic app that uses Masq for storage',
  icon: 'http://example.org/icon.png'
}

document.getElementById('registerButton').addEventListener('click', function () {
  client.addApp(regParams).then(function (token) {
    // store the authorization token for future use
    window.localStorage.setItem('token', token)
    // init your app logic
  })
})
```

## Store app data remotely

```JavaScript
var key = 'hello'
var appData = {}
appData.date = Date.now() // 1510847132596
appData.text = 'Hello World!'

client.setItem(key, appData).then(function () {
  // success
}).catch(function (err) {
  console.log(err)
})
```


## Get the remote data for a given key

```JavaScript
var key = 'hello'

client.getItem(key).then(function (data) {
  console.log(data) // prints { date: 1510847132596, text: "Hello World!" }
}).catch(function (err) {
  console.log(err)
})
```


## List all key for this app

```JavaScript
client.listKeys().then(function (keys) {
  console.log(keys) // prints ['hello']
})
```


## Delete a specific key

```JavaScript
var key = 'hello'

client.removeItem(key).then(function () {
  // success, we have deleted the key "hello"
})
```


## License

MIT

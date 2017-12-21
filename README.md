# Masq Client

[![](https://img.shields.io/badge/project-Masq-7C4DFF.svg?style=flat-square)](https://github.com/QwantResearch/masq-store)

![Masq Logo](https://i.imgur.com/qZ3dq0Q.png)

Promise-based client library for Qwant Masq. It allows applications to connect to the [Masq Hub](https://github.com/QwantResearch/masq-hub) (central data manager) to store and retrieve application data.

# Install

## Developer

```
git clone https://github.com/QwantResearch/masq-client.git
cd client
npm install
npm start
```

# Example usage

Add the client JS reference in your page:

```HTML
<script type="text/javascript" src="dist/masq.js"></script>
```

Or the minified version:

```HTML
<script type="text/javascript" src="dist/masq.min.js"></script>
```

You can also use the online version hosted on Github pages:

```HTML
<script type="text/javascript" src="https://qwantresearch.github.io/masq-client/dist/masq.min.js"></script>
```

Using the client library in your app:

```JavaScript
// Define the hub URL (where the data will be persisted)
var storeURL = 'https://sync-beta.qwantresearch.com/'

// Initialize the store
var masqStore = new MasqClient(storeURL)
```

**NOTE:** You can find a fully working example in the `/example` dir.

# API

## Initializing the client

```JavaScript
var masqStore = new MasqClient()
```

## Storing a local data object remotely

```JavaScript
var appData = {}
appData.date = Date.now() // 1510847132596
appData.text = 'Hello'

masqStore.setAll(appData).then(function () {
  // success
}).catch(function (err) {
  console.log(err)
})
```

## Getting all the remote data

```JavaScript
masqStore.onConnect().then(function () {
  masqStore.getAll().then(function (data) {
    console.log(data) // prints { date: 1510847132596, text: "Hello" }
  }).catch(function (err) {
    console.log(err)
  })
}).catch(function (err) {
  console.log(err)
})
```

## Update (set) a specific key/value pair

```JavaScript
masqStore.set('text', 'Hello world').then(function () {
  // success
}).catch(function (err) {
  console.log(err)
})
```

## Get the value for a specific key

```JavaScript
masqStore.get('text').then(function (res) {
  console.log(res) // prints "Hello world"
}).catch(function (err) {
  console.log(err)
})
```

## Delete a specific key

```JavaScript
masqStore.del('date').then(function () {
  // success, we have deleted the key "date"
  // let's fetch all the remote data to take a look at what's left
  masqStore.getAll().then(function (data) {
    console.log(data) // prints { text: "Hello world" }
  }).catch(function (err) {
    console.log(err)
  })
}).catch(function (err) {
  console.log(err)
})
```

## Delete (clear) all the remote data

```JavaScript
masqStore.clear().then(function() {
  masqStore.getAll().then(function (data) {
    console.log(data) // prints {}
  }).catch(function (err) {
    console.log(err)
  })
}).catch(function (err) {
  console.log(err)
})
```

## Register an App

```JavaScript
var regParams = {
  endpoint: STORE,
  url: 'http://example.org',
  title: 'Example app',
  desc: 'A generic app that uses Masq for storage',
  icon: 'http://example.org/logo.png'
}

document.getElementById('registerButton').addEventListener('click', function () {
  masqStore.registerApp(regParams).then(function (e) {
    // get the data from the store using masqStore.getAll() 
  })
})
```

## Listen for changes to the store (e.g. sync events)

```JavaScript
document.addEventListener('Sync', function (event) {
  if (masqStore) {
    masqStore.getAll().then(function (res) {
      // update your local app state with data from 'res'
    })
  }
})
```

## License

Apache-2.0
# Masq.js

Promise-based client library for Qwant Masq. It allows applications to connect to the Masq Hub (central data manager) to store and retrieve application data.

# Install

## Developer

```
git clone https://git.qwant.ninja/masq/client.git
cd client
npm install
npm start
```

# Example usage

Add the client JS reference in your page:

```JavaScript
<script type="text/javascript" src="src/client.js"></script>
```

Using the client library in your app:

```JavaScript
var masqStore = new MasqClient()

// Your app data (store)
var appData = {}

// Load all remote app state on initial connect
var getRemoteData = function () {
  return masqStore.getAll()
}
masqStore.onConnect().then(getRemoteData).then(function (res) {
  // update your local store
  appData = res
  console.log('Loaded remote app state:', appData)

  // Add some data in case it's the first time
  if (!appData['counter']) {
    appData['counter'] = 0
  }

  // Update a few values
  appData['counter']++
  appData['date'] = Date.now()

  // persist all local data remotely
  masqStore.setAll(appData).then(function () {
    console.log('Wrote updated value for key "counter":', appData['counter'])

    // retrieve the remote state for one particular key (e.g. counter)
    masqStore.get('counter').then(function (res) {
      console.log('Got remote value for key "counter":', res)

      if (appData['counter'] === 2) {
        // delete the counter data remotely
        masqStore.del('counter').then(getRemoteData).then(function (res) {
          console.log('Loaded remote app state:', res)
          // clear remote store
          masqStore.clear().then(getRemoteData).then(function (res) {
            console.log('Loaded remote app state:', res)
          })
        })
      }
    })
  })
}).catch(function (err) {
  console.log(err)
})
```

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
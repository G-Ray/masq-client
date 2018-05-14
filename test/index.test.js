import * as client from '../src/index'
import * as socket from 'masq-socket'
import MasqStore from 'masq-store'
import common from 'masq-common'

import localforage from 'localforage'

jest.mock('localforage')

const Client = client.Client

const PORT = 8080

let conf = {
  socketUrl: `ws://localhost:${PORT}`
}

let server
let store

beforeAll(async () => {
  // Setup store
  store = new MasqStore.Masq({storage: localforage})

  await store.init()
  await store.createUser({
    username: 'foo'
  })
  await store.signIn('foo')

  // Start the mock WebSocket server
  server = new socket.Server(PORT, store, localforage)
  await server.init()
  server.onRegister(async (appMeta) => {
    const token = await store.addApp(appMeta)
    server.finishRegistration(token)
  })
})

// Test Sync server functionality
describe('Client lib', async () => {
  let MasqClient
  let pushMsg
  const data = { bar: 'bar' }
  const appInfo = {
    url: 'https://masq.io/search',
    name: 'Masq Search',
    description: 'Masq Search'
  }

  const pushCallback = (msg) => {
    pushMsg = msg
  }

  it('should fail to init WebSocket client on a bad URL', async () => {
    MasqClient = new Client({
      socketUrl: `ws://localhost:9999`
    })
    await expect(MasqClient.initWS()).rejects.toBeDefined()
  })

  it('should successfully init WebSocket client', async () => {
    MasqClient = new Client(conf)
    await expect(MasqClient.initWS(pushCallback)).resolves.toBe(true)
  })

  it('should successfully add an app', async () => {
    await MasqClient.addApp(appInfo)
    expect(MasqClient.token()).toBeDefined()
  })

  it('should fail to add an app if no data is set', async () => {
    expect.assertions(2)
    await MasqClient.addApp().catch(err => {
      expect(err).toBeDefined()
    })

    const appInfo = {
      description: 'Masq Search'
    }
    await MasqClient.addApp(appInfo).catch(err => {
      expect(err).toBeDefined()
    })
  })

  it('should successfully set/get item', async () => {
    const data = { bar: 'bar' }
    await MasqClient.setItem('foo', data)
    const val = await MasqClient.getItem('foo')
    expect(val).toEqual(data)
  })

  it('should fail to setItem if no key is provided', async () => {
    expect.assertions(1)
    await MasqClient.setItem().catch(err => {
      expect(err.name).toBe(common.ERRORS.NOVALUE)
    })
  })

  it('should fail to getItem if no key is provided', async () => {
    expect.assertions(1)
    await MasqClient.getItem().catch(err => {
      expect(err.name).toBe(common.ERRORS.NOVALUE)
    })
  })

  it('should fail to getItem if it does not exist', async () => {
    const resp = await MasqClient.getItem('bar')
    expect(resp).toBeUndefined()
  })

  it('should successfully overwrite previous data', async (done) => {
    await MasqClient.setItem('foo', data)
    const resp = await MasqClient.getItem('foo')
    expect(resp).toEqual(data)
    done()
  })

  it('should successfully removeItem', async () => {
    await MasqClient.removeItem('foo')
    const resp = await MasqClient.getItem('foo')
    expect(resp).toBeUndefined()
  })

  it('should fail to deleteItem without a key', async () => {
    expect.assertions(1)
    await MasqClient.removeItem().catch(err => {
      expect(err.name).toBe(common.ERRORS.NOVALUE)
    })
  })

  it('should fail to delete inexistent item', async () => {
    expect.assertions(2)
    await MasqClient.removeItem('bar').catch(err => {
      expect(err.status).toEqual(500)
      expect(err.name).toBe(common.ERRORS.NOVALUE)
    })
  })

  it('should successfully listItems', async () => {
    await MasqClient.setItem('foo', data)
    const resp = await MasqClient.listKeys()
    expect(resp).toEqual(['foo'])
  })

  it('should fail to getItem if token expired', async () => {
    expect.assertions(2)
    await store.profileStore.setItem('tokenList', {})
    await MasqClient.getItem('foo').catch(err => {
      expect(err.status).toEqual(403)
      expect(err.name).toBe(common.ERRORS.NOTAUTHORIZED)
    })
  })

  it('should fail to setItem if token expired', async () => {
    expect.assertions(2)
    await MasqClient.setItem('foo', {}).catch(err => {
      expect(err.status).toEqual(403)
      expect(err.name).toBe(common.ERRORS.NOTAUTHORIZED)
    })
  })

  it('should fail to setItem if no token exists', async () => {
    expect.assertions(1)
    MasqClient.authToken = null
    await MasqClient.setItem('foo').catch(err => {
      expect(err.name).toBe(common.ERRORS.NOTOKEN)
    })
  })

  it('should fail to getItem if no token exists', async () => {
    expect.assertions(1)
    await MasqClient.getItem('foo').catch(err => {
      expect(err.name).toBe(common.ERRORS.NOTOKEN)
    })
  })

  it('should fail to removeItem if no token exists', async () => {
    expect.assertions(1)
    await MasqClient.removeItem('foo').catch(err => {
      expect(err.name).toBe(common.ERRORS.NOTOKEN)
    })
  })

  it('should fail to listKeys if no token exists', async () => {
    expect.assertions(1)
    await MasqClient.listKeys().catch(err => {
      expect(err.name).toBe(common.ERRORS.NOTOKEN)
    })
  })

  it('should be able to re-register the app for a new token', async () => {
    const newToken = await MasqClient.addApp(appInfo)
    expect(newToken).toBeDefined()
    expect(MasqClient.token()).toEqual(newToken)
  })

  it('should fail the request when using the wrong token', async () => {
    expect.assertions(3)
    conf.authToken = 'foo'
    MasqClient = new Client(conf)
    await expect(MasqClient.initWS(pushCallback)).resolves.toBe(true)
    await MasqClient.getItem('foo').catch(err => {
      expect(err.status).toEqual(403)
      expect(err.name).toBe(common.ERRORS.NOTAUTHORIZED)
    })
  })

  it('should be able to reuse the token', async () => {
    const newToken = await MasqClient.addApp(appInfo)
    conf.authToken = newToken
    MasqClient = new Client(conf)
    await expect(MasqClient.initWS(pushCallback)).resolves.toBe(true)
    const resp = await MasqClient.getItem('foo')
    expect(resp).toEqual(data)
  })

  it('should successfully getItem with new token', async () => {
    const resp = await MasqClient.getItem('foo')
    expect(resp).toEqual(data)
  })

  it('should receive push events from the server', async (done) => {
    const pushdata = { action: 'push', data: { foo: 'baz' } }
    // send push
    const conn = await server
    conn.connections.forEach((client) => {
      client.send(JSON.stringify(pushdata))
    })
    setTimeout(() => {
      expect(pushMsg).toEqual(pushdata)
      done()
    }, 100)
  })
})

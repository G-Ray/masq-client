import socket from 'masq-socket'
import common from 'masq-common'

class Client {
  constructor (conf = {}) {
    this.conf = conf
    this.ws = undefined
    this.authToken = conf.authToken
  }

  initWS (callBack) {
    return new Promise((resolve, reject) => {
      this.ws = new socket.Client(this.conf.socketUrl, this.conf.socketConf)
      this.ws.onmessage((message) => {
        if (message.action && message.action === 'push') {
          callBack(message)
        }
      })
      this.ws.onerror((error) => {
        return reject(error)
      })
      this.ws.onopen(() => {
        return resolve(true)
      })
    })
  }

  token () {
    return this.authToken
  }

  addApp (data = {}) {
    return new Promise((resolve, reject) => {
      var request = {
        action: 'addApp',
        data: data
      }
      this.ws.send(request, (response) => {
        if (response.data.status !== 200) {
          return reject(response.data)
        }
        this.authToken = response.data.authToken
        return resolve(response.data.authToken)
      })
    })
  }

  setItem (key, value = {}) {
    if (!key || key.length === 0) {
      throw common.generateError(common.ERRORS.NOVALUE)
    }
    if (!this.token()) {
      throw common.generateError(common.ERRORS.NOTOKEN)
    }
    var request = {
      token: this.token(),
      action: 'setItem',
      data: {
        key: key,
        value: value
      }
    }
    return new Promise((resolve, reject) => {
      this.ws.send(request, (response) => {
        if (response.data.status !== 200) {
          return reject(response.data)
        }
        return resolve(response.data.data)
      })
    })
  }

  getItem (key) {
    if (!key || key.length === 0) {
      throw common.generateError(common.ERRORS.NOVALUE)
    }
    if (!this.token()) {
      throw common.generateError(common.ERRORS.NOTOKEN)
    }
    var request = {
      token: this.token(),
      action: 'getItem',
      data: {
        key: key
      }
    }
    return new Promise((resolve, reject) => {
      this.ws.send(request, (response) => {
        if (response.data.status !== 200) {
          return reject(response.data)
        }
        return resolve(response.data.data)
      })
    })
  }

  removeItem (key) {
    if (!key || key.length === 0) {
      throw common.generateError(common.ERRORS.NOVALUE)
    }
    if (!this.token()) {
      throw common.generateError(common.ERRORS.NOTOKEN)
    }
    var request = {
      token: this.token(),
      action: 'removeItem',
      data: {
        key: key
      }
    }
    return new Promise((resolve, reject) => {
      this.ws.send(request, (response) => {
        if (response.data.status !== 200) {
          return reject(response.data)
        }
        return resolve(response.data.data)
      })
    })
  }

  listKeys () {
    if (!this.token()) {
      throw common.generateError(common.ERRORS.NOTOKEN)
    }
    var request = {
      token: this.token(),
      action: 'listKeys'
    }
    return new Promise((resolve, reject) => {
      this.ws.send(request, (response) => {
        if (response.data.status !== 200) {
          return reject(response.data)
        }
        return resolve(response.data.data)
      })
    })
  }
}

module.exports.Client = Client

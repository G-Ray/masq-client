import socket from 'masq-socket'
import common from 'masq-common'

class Client {
  constructor (conf = {}) {
    this.conf = conf
    this.ws = undefined
    this.authToken = conf.authToken
  }

  initWS (callBack) {
    let self = this
    return new Promise((resolve, reject) => {
      self.ws = new socket.Client(self.conf.socketUrl, self.conf.socketConf)
      self.ws.onmessage((message) => {
        if (message.action && message.action === 'push') {
          callBack(message)
        }
      })
      self.ws.onerror((error) => {
        return reject(error)
      })
      self.ws.onopen(() => {
        return resolve(true)
      })
    })
  }

  token () {
    return this.authToken
  }

  addApp (data = {}) {
    let self = this
    return new Promise((resolve, reject) => {
      var request = {
        action: 'addApp',
        data: data
      }
      self.ws.send(request, (response) => {
        if (response.data.status !== 200) {
          return reject(response.data)
        }
        self.authToken = response.data.authToken
        return resolve(response.data.authToken)
      })
    })
  }

  async setItem (key, value = {}) {
    let self = this
    if (!key || key.length === 0) {
      throw common.generateError(common.ERRORS.NOVALUE)
    }
    if (!self.token()) {
      throw common.generateError(common.ERRORS.NOTOKEN)
    }
    var request = {
      token: self.token(),
      action: 'setItem',
      data: {
        key: key,
        value: value
      }
    }
    return new Promise((resolve, reject) => {
      self.ws.send(request, (response) => {
        if (response.data.status !== 200) {
          return reject(response.data)
        }
        return resolve(response.data.data)
      })
    })
  }

  async getItem (key) {
    let self = this
    if (!key || key.length === 0) {
      throw common.generateError(common.ERRORS.NOVALUE)
    }
    if (!self.token()) {
      throw common.generateError(common.ERRORS.NOTOKEN)
    }
    var request = {
      token: self.token(),
      action: 'getItem',
      data: {
        key: key
      }
    }
    return new Promise((resolve, reject) => {
      self.ws.send(request, (response) => {
        if (response.data.status !== 200) {
          return reject(response.data)
        }
        return resolve(response.data.data)
      })
    })
  }

  async removeItem (key) {
    let self = this
    if (!key || key.length === 0) {
      throw common.generateError(common.ERRORS.NOVALUE)
    }
    if (!self.token()) {
      throw common.generateError(common.ERRORS.NOTOKEN)
    }
    var request = {
      token: self.token(),
      action: 'removeItem',
      data: {
        key: key
      }
    }
    return new Promise((resolve, reject) => {
      self.ws.send(request, (response) => {
        if (response.data.status !== 200) {
          return reject(response.data)
        }
        return resolve(response.data.data)
      })
    })
  }

  async listKeys () {
    let self = this
    if (!self.token()) {
      throw common.generateError(common.ERRORS.NOTOKEN)
    }
    var request = {
      token: self.token(),
      action: 'listKeys'
    }
    return new Promise((resolve, reject) => {
      self.ws.send(request, (response) => {
        if (response.data.status !== 200) {
          return reject(response.data)
        }
        return resolve(response.data.data)
      })
    })
  }
}

module.exports.Client = Client

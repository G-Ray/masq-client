(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.MasqClient = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
   * Forked from https://gitstore.com/zendesk/cross-storage
   *
   * Constructs a new cross storage client given the url to a store. By default,
   * it uses a content script injected by the Masq extension. It also accepts an
   * options object, which may include a timeout, and promise. The timeout, in
   * milliseconds, is applied to each request and defaults to 5000ms.
   * If the promise key is supplied the constructor for a Promise, that Promise
   * library will be used instead of the default window.Promise.
   *
   * @example
   * var storage = new MasqClient('https://store.example.com/store.html');
   *
   * @example
   * var storage = new MasqClient('https://store.example.com/store.html', {
   *   timeout: 5000
   * });
   *
   * @constructor
   *
   * @param {string} url    The url to a cross storage store
   * @param {object} [opts] An optional object containing additional options,
   *                        including timeout, and promise
   *
   * @property {string}   _id            A UUID v4 id
   * @property {function} _promise       The Promise object to use
   * @property {string}   _origin        The store's origin
   * @property {object}   _requests      Mapping of request ids to callbacks
   * @property {bool}     _connected     Whether or not it has connected
   * @property {bool}     _closed        Whether or not the client has closed
   * @property {int}      _count         Number of requests sent
   * @property {function} _listener      The listener added to the window
   * @property {Window}   _store         The store window
   * @property {string}   _storeURL      Default endpoint URL for the store
   * @property {Window}   _regwindow     The app registration window
   */
var MasqClient = function () {
  function MasqClient(url, opts) {
    _classCallCheck(this, MasqClient);

    this._storeURL = url || window.location.origin;

    opts = opts || {};

    this._id = this._generateUUID();
    this._promise = opts.promise || Promise;
    this._origin = this._getOrigin(this._storeURL);
    this._requests = {};
    this._connected = false;
    this._closed = false;
    this._count = 0;
    this._timeout = opts.timeout || 5000;
    this._listener = null;
    this._regwindow = null;

    this._installListener();

    // Set the store object (typically the window)
    this._store = opts.store || window;
  }

  /**
     * Returns the origin of an url, with cross browser support. Accommodates
     * the lack of location.origin in IE, as well as the discrepancies in the
     * inclusion of the port when using the default port for a protocol, e.g.
     * 443 over https. Defaults to the origin of window.location if passed a
     * relative path.
     *
     * @param   {string} url The url to a cross storage store
     * @returns {string} The origin of the url
     */


  _createClass(MasqClient, [{
    key: '_getOrigin',
    value: function _getOrigin(url) {
      var uri, protocol, origin;

      uri = document.createElement('a');
      uri.href = url;

      if (!uri.host) {
        uri = window.location;
      }

      if (!uri.protocol || uri.protocol === ':') {
        protocol = window.location.protocol;
      } else {
        protocol = uri.protocol;
      }

      origin = protocol + '//' + uri.host;
      origin = origin.replace(/:80$|:443$/, '');

      return origin;
    }

    /**
       * UUID v4 generation, taken from: http://stackoverflow.com/questions/
       * 105034/how-to-create-a-guid-uuid-in-javascript/2117523#2117523
       *
       * @returns {string} A UUID v4 string
       */

  }, {
    key: '_generateUUID',
    value: function _generateUUID() {
      return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, function (c) {
        return (c ^ window.crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16);
      });
    }

    /**
       * Returns a promise that is fulfilled when a connection has been established
       * with the cross storage store. Its use is required to avoid sending any
       * requests prior to initialization being complete.
       *
       * @returns {Promise} A promise that is resolved on connect
       */

  }, {
    key: 'onConnect',
    value: function onConnect() {
      var client = this;

      if (this._connected) {
        return this._promise.resolve();
      } else if (this._closed) {
        return this._promise.reject(new Error('MasqClient has closed'));
      }

      // Queue connect requests for client re-use
      if (!this._requests.connect) {
        this._requests.connect = [];
      }

      return new this._promise(function (resolve, reject) {
        var timeout = setTimeout(function () {
          reject(new Error('MasqClient could not connect to ' + client._storeURL));
        }, client._timeout);

        client._requests.connect.push(function (err) {
          clearTimeout(timeout);
          if (err) return reject(err);

          resolve();
        });
      });
    }

    /**
       * Registers an app with the store.
       *
       * @param   {object}  params   Parameters that describe the app
       * @returns {Promise} A promise that is settled on app registration status
       */

  }, {
    key: 'registerApp',
    value: function registerApp(params) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        if (_this._regwindow === undefined || _this._regwindow.closed) {
          var w = 400;
          var h = 600;

          // TODO: replace endpoint with extension (how to trigger extension?)
          params.endpoint = params.endpoint || _this._endpoint;
          if (!params.url) {
            reject(new Error('No app URL provided to registerApp()'));
          }
          var url = params.endpoint + '?add=1&appUrl=' + encodeURIComponent(params.url);
          if (params.title) {
            url += '&title=' + encodeURIComponent(params.title);
          }
          if (params.desc) {
            url += '&desc=' + encodeURIComponent(params.desc);
          }
          if (params.icon) {
            url += '&icon=' + encodeURIComponent(params.icon);
          }

          var dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screen.left;
          var dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screen.top;

          var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : window.screen.width;
          var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : window.screen.height;

          var left = width / 2 - w / 2 + dualScreenLeft;
          var top = height / 2 - h / 2 + dualScreenTop;
          _this._regwindow = window.open(url, '', 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

          // Puts focus on the newWindow
          if (window.focus) {
            _this._regwindow.focus();
          }

          // wrap onunload in a load event to avoid it being triggered too early
          window.addEventListener('message', function (e) {
            if (e.data === 'REGISTRATIONFINISHED') {
              resolve(e);
            }
          }, false);
        }
      });
    }

    /**
       * Sets a key to the specified value. Returns a promise that is fulfilled on
       * success, or rejected if any errors setting the key occurred, or the request
       * timed out.
       *
       * @param   {string}  key   The key to set
       * @param   {*}       value The value to assign
       * @returns {Promise} A promise that is settled on store response or timeout
       */

  }, {
    key: 'set',
    value: function set(key, value) {
      return this._request('set', {
        key: key,
        value: value
      });
    }

    /**
       * Accepts one or more keys for which to retrieve their values. Returns a
       * promise that is settled on store response or timeout. On success, it is
       * fulfilled with the value of the key if only passed a single argument.
       * Otherwise it's resolved with an array of values. On failure, it is rejected
       * with the corresponding error message.
       *
       * @param   {...string} key The key to retrieve
       * @returns {Promise}   A promise that is settled on store response or timeout
       */

  }, {
    key: 'get',
    value: function get(key) {
      var args = Array.prototype.slice.call(arguments);

      return this._request('get', { keys: args });
    }

    /**
       * Accepts one or more keys for deletion. Returns a promise that is settled on
       * store response or timeout.
       *
       * @param   {...string} key The key to delete
       * @returns {Promise}   A promise that is settled on store response or timeout
       */

  }, {
    key: 'del',
    value: function del() {
      var args = Array.prototype.slice.call(arguments);

      return this._request('del', { keys: args });
    }

    /**
       * Clears all the remote store for the current origin.
       *
       * Returns a promise that, when resolved, indicates that all localStorage
       * data has been cleared.
       *
       * @returns {Promise} A promise that is settled on store response or timeout
       */

  }, {
    key: 'clear',
    value: function clear() {
      return this._request('clear');
    }

    /**
       * Gets all the remote data for the current origin.
       *
       * Returns a promise that, when resolved, passes an array of all keys
       * currently in storage.
       *
       * @returns {Promise} A promise that is settled on store response or timeout
       */

  }, {
    key: 'getAll',
    value: function getAll() {
      return this._request('getAll');
    }

    /**
       * Sets all data for the current origin.
       *
       * Returns a promise that, when resolved, passes an array of all keys
       * currently in storage.
       *
       * @param   {object}  data   The data object to set
       * @returns {Promise} A promise that is settled on store response or timeout
       */

  }, {
    key: 'setAll',
    value: function setAll(data) {
      return this._request('setAll', data);
    }

    /**
       * Gets the current user's public profile data.
       *
       * Returns a promise that, when resolved, passes an array of all keys
       * currently in storage.
       *
       * @returns {Promise} A promise that is settled on store response or timeout
       */

  }, {
    key: 'user',
    value: function user() {
      return this._request('user');
    }

    /**
       * Deletes the iframe and sets the connected state to false. The client can
       * no longer be used after being invoked.
       */

  }, {
    key: 'close',
    value: function close() {
      // Support IE8 with detachEvent
      if (window.removeEventListener) {
        window.removeEventListener('message', this._listener, false);
      } else {
        window.detachEvent('onmessage', this._listener);
      }

      this._connected = false;
      this._closed = true;
    }

    /**
       * Installs the necessary listener for the window message event. When a message
       * is received, the client's _connected status is changed to true, and the
       * onConnect promise is fulfilled. Given a response message, the callback
       * corresponding to its request is invoked. If response.error holds a truthy
       * value, the promise associated with the original request is rejected with
       * the error. Otherwise the promise is fulfilled and passed response.result.
       *
       * @private
       */

  }, {
    key: '_installListener',
    value: function _installListener() {
      var client = this;

      this._listener = function (message) {
        var i, origin, error, response;

        // Ignore invalid messages or those after the client has closed
        if (client._closed || !message.data) {
          return;
        }

        // postMessage returns the string "null" as the origin for "file://"
        origin = message.origin === 'null' ? 'file://' : message.origin;

        // Ignore messages not from the correct origin
        if (origin !== client._origin) return;

        // LocalStorage isn't available in the store
        if (message.data['cross-storage'] === 'unavailable') {
          if (!client._closed) client.close();
          if (!client._requests.connect) return;

          error = new Error('Closing client. Could not access localStorage in store.');
          for (i = 0; i < client._requests.connect.length; i++) {
            client._requests.connect[i](error);
          }

          return;
        }

        // Handle initial connection
        if (message.data['cross-storage'] && !client._connected) {
          if (message.data['cross-storage'] === 'listening') {
            client._init();
            return;
          }
          client._connected = true;
          if (!client._requests.connect) return;

          for (i = 0; i < client._requests.connect.length; i++) {
            client._requests.connect[i](error);
          }
          delete client._requests.connect;
        }

        if (message.data['cross-storage'] === 'ready') return;

        // All other messages
        try {
          response = message.data;
        } catch (e) {
          return;
        }

        if (!response.client) return;
        console.log('receive response');
        console.log(response);
        // Tell the app the we updated the data following a sync event
        if (message.data['sync']) {
          var syncEvt = new window.CustomEvent('Sync');
          document.dispatchEvent(syncEvt);
        }

        if (client._requests[response.client]) {
          client._requests[response.client](response.error, response.result);
        }
      };

      // Support IE8 with attachEvent
      if (window.addEventListener) {
        window.addEventListener('message', this._listener, false);
      } else {
        window.attachEvent('onmessage', this._listener);
      }
    }

    /**
       * Invoked when a frame id was passed to the client, rather than allowing
       * the client to create its own iframe. Polls the store for a ready event to
       * establish a connected state.
       */

  }, {
    key: '_init',
    value: function _init() {
      var client, interval, targetOrigin;

      client = this;

      // postMessage requires that the target origin be set to "*" for "file://"
      targetOrigin = client._origin === 'file://' ? '*' : client._origin;

      interval = setInterval(function () {
        if (client._connected) return clearInterval(interval);
        if (!client._store) return;

        client._store.postMessage({ 'cross-storage': 'init' }, targetOrigin);
      }, 100);
    }

    /**
       * Sends a message containing the given method and params to the store. Stores
       * a callback in the _requests object for later invocation on message, or
       * deletion on timeout. Returns a promise that is settled in either instance.
       *
       * @private
       *
       * @param   {string}  method The method to invoke
       * @param   {*}       params The arguments to pass
       * @returns {Promise} A promise that is settled on store response or timeout
       */

  }, {
    key: '_request',
    value: function _request(method, params) {
      var req, client;

      if (this._closed) {
        return this._promise.reject(new Error('MasqClient has closed'));
      }

      client = this;
      client._count++;

      req = {
        client: this._id + ':' + client._count,
        method: method,
        params: params
      };

      return new this._promise(function (resolve, reject) {
        var timeout, originalToJSON, targetOrigin;

        // Timeout if a response isn't received after 4s
        timeout = setTimeout(function () {
          if (!client._requests[req.client]) return;

          delete client._requests[req.client];
          reject(new Error('Timeout: could not perform ' + req.method));
        }, client._timeout);

        // Add request callback
        client._requests[req.client] = function (err, result) {
          clearTimeout(timeout);
          delete client._requests[req.client];
          if (err) return reject(new Error(err));
          resolve(result);
        };

        // In case we have a broken Array.prototype.toJSON, e.g. because of
        // old versions of prototype
        if (window.Array.prototype.toJSON) {
          originalToJSON = Array.prototype.toJSON;
          window.Array.prototype.toJSON = null;
        }

        // postMessage requires that the target origin be set to "*" for "file://"
        targetOrigin = client._origin === 'file://' ? '*' : client._origin;

        // Send  message
        client._store.postMessage(req, targetOrigin);

        // Restore original toJSON
        if (originalToJSON) {
          window.Array.prototype.toJSON = originalToJSON;
        }
      });
    }
  }]);

  return MasqClient;
}();

// export default MasqClient
// export { MasqClient }

// module.exports = MasqClient

/**
   * Export for various environments.
   */


if (typeof module !== 'undefined' && module.exports) {
  module.exports = MasqClient;
} else if (typeof exports !== 'undefined') {
  exports.MasqClient = MasqClient;
} else if (typeof define === 'function' && define.amd) {
  define([], function () {
    return MasqClient;
  });
} else {
  root.MasqClient = MasqClient;
}
},{}]},{},[1])(1)
});
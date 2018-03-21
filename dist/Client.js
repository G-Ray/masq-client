'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * MasqClient
 * @constructor
 * @param {Object} params - The parameters
 * @param {string} [params.mode] - The encryption mode : aes-gcm, aes-cbc
 */
var Client = function () {
  function Client(params) {
    _classCallCheck(this, Client);

    this._connected = false;
    this._count = 0;
  }

  /**
  * If raw, import the key and return the Crypt
  *
  * @param {string} key - The key name of the stored object
  * @param {any} value - THe value of the stored object
  */


  _createClass(Client, [{
    key: 'setItem',
    value: function setItem(key, value) {
      console.log('1');
      var req = {
        type: 'set',
        data: JSON.stringify({ key: value })
        // console.log(req)
      };window.postMessage(req, '*');
    }
  }]);

  return Client;
}();

exports.default = Client;
exports.Client = Client;
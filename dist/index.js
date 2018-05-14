'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Client = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _masqSocket = require('masq-socket');

var _masqSocket2 = _interopRequireDefault(_masqSocket);

var _masqCommon = require('masq-common');

var _masqCommon2 = _interopRequireDefault(_masqCommon);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Client = exports.Client = function () {
  function Client() {
    var conf = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck3.default)(this, Client);

    this.conf = conf;
    this.ws = undefined;
    this.authToken = conf.authToken;
  }

  (0, _createClass3.default)(Client, [{
    key: 'initWS',
    value: function initWS(callBack) {
      var self = this;
      return new Promise(function (resolve, reject) {
        self.ws = new _masqSocket2.default.Client(self.conf.socketUrl, self.conf.socketConf);
        self.ws.onmessage(function (message) {
          if (message.action && message.action === 'push') {
            callBack(message);
          }
        });
        self.ws.onerror(function (error) {
          return reject(error);
        });
        self.ws.onopen(function () {
          return resolve(true);
        });
      });
    }
  }, {
    key: 'token',
    value: function token() {
      return this.authToken;
    }
  }, {
    key: 'addApp',
    value: function addApp() {
      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var self = this;
      return new Promise(function (resolve, reject) {
        var request = {
          action: 'addApp',
          data: data
        };
        self.ws.send(request, function (response) {
          if (response.data.status !== 200) {
            return reject(response.data);
          }
          self.authToken = response.data.authToken;
          return resolve(response.data.authToken);
        });
      });
    }
  }, {
    key: 'setItem',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(key) {
        var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var self, request;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                self = this;

                if (!(!key || key.length === 0)) {
                  _context.next = 3;
                  break;
                }

                throw _masqCommon2.default.generateError(_masqCommon2.default.ERRORS.NOVALUE);

              case 3:
                if (self.token()) {
                  _context.next = 5;
                  break;
                }

                throw _masqCommon2.default.generateError(_masqCommon2.default.ERRORS.NOTOKEN);

              case 5:
                request = {
                  token: self.token(),
                  action: 'setItem',
                  data: {
                    key: key,
                    value: value
                  }
                };
                return _context.abrupt('return', new Promise(function (resolve, reject) {
                  self.ws.send(request, function (response) {
                    if (response.data.status !== 200) {
                      return reject(response.data);
                    }
                    return resolve(response.data.data);
                  });
                }));

              case 7:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function setItem(_x4) {
        return _ref.apply(this, arguments);
      }

      return setItem;
    }()
  }, {
    key: 'getItem',
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(key) {
        var self, request;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                self = this;

                if (!(!key || key.length === 0)) {
                  _context2.next = 3;
                  break;
                }

                throw _masqCommon2.default.generateError(_masqCommon2.default.ERRORS.NOVALUE);

              case 3:
                if (self.token()) {
                  _context2.next = 5;
                  break;
                }

                throw _masqCommon2.default.generateError(_masqCommon2.default.ERRORS.NOTOKEN);

              case 5:
                request = {
                  token: self.token(),
                  action: 'getItem',
                  data: {
                    key: key
                  }
                };
                return _context2.abrupt('return', new Promise(function (resolve, reject) {
                  self.ws.send(request, function (response) {
                    if (response.data.status !== 200) {
                      return reject(response.data);
                    }
                    return resolve(response.data.data);
                  });
                }));

              case 7:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getItem(_x5) {
        return _ref2.apply(this, arguments);
      }

      return getItem;
    }()
  }, {
    key: 'removeItem',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(key) {
        var self, request;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                self = this;

                if (!(!key || key.length === 0)) {
                  _context3.next = 3;
                  break;
                }

                throw _masqCommon2.default.generateError(_masqCommon2.default.ERRORS.NOVALUE);

              case 3:
                if (self.token()) {
                  _context3.next = 5;
                  break;
                }

                throw _masqCommon2.default.generateError(_masqCommon2.default.ERRORS.NOTOKEN);

              case 5:
                request = {
                  token: self.token(),
                  action: 'removeItem',
                  data: {
                    key: key
                  }
                };
                return _context3.abrupt('return', new Promise(function (resolve, reject) {
                  self.ws.send(request, function (response) {
                    if (response.data.status !== 200) {
                      return reject(response.data);
                    }
                    return resolve(response.data.data);
                  });
                }));

              case 7:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function removeItem(_x6) {
        return _ref3.apply(this, arguments);
      }

      return removeItem;
    }()
  }, {
    key: 'listKeys',
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
        var self, request;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                self = this;

                if (self.token()) {
                  _context4.next = 3;
                  break;
                }

                throw _masqCommon2.default.generateError(_masqCommon2.default.ERRORS.NOTOKEN);

              case 3:
                request = {
                  token: self.token(),
                  action: 'listKeys'
                };
                return _context4.abrupt('return', new Promise(function (resolve, reject) {
                  self.ws.send(request, function (response) {
                    if (response.data.status !== 200) {
                      return reject(response.data);
                    }
                    return resolve(response.data.data);
                  });
                }));

              case 5:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function listKeys() {
        return _ref4.apply(this, arguments);
      }

      return listKeys;
    }()
  }]);
  return Client;
}();
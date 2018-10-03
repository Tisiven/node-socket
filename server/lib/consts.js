"use strict";

exports.__esModule = true;
exports.IP = exports.KEYS = exports.PORT = exports.DEV = void 0;

var _internalIp = _interopRequireDefault(require("internal-ip"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DEV = process.env.NODE_ENV === 'development';
exports.DEV = DEV;
const PORT = process.env.PORT || 3000;
exports.PORT = PORT;
const KEYS = ['aGRqYWhqZGpmbHNhamtsZGZqbGtz'];
exports.KEYS = KEYS;

const IP = _internalIp.default.v4.sync();

exports.IP = IP;
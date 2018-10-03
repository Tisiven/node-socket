"use strict";

var _path = _interopRequireDefault(require("path"));

var _http = _interopRequireDefault(require("http"));

var _koa = _interopRequireDefault(require("koa"));

var _koaLogger = _interopRequireDefault(require("koa-logger"));

var _koaBodyparser = _interopRequireDefault(require("koa-bodyparser"));

var _koaStatic = _interopRequireDefault(require("koa-static"));

var _consts = require("./consts");

var _handlers = _interopRequireDefault(require("./handlers"));

var _routes = _interopRequireDefault(require("./routes"));

var _socketHandler = _interopRequireDefault(require("./socketHandler"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const app = new _koa.default();
app.keys = _consts.KEYS;

if (_consts.DEV) {
  app.use((0, _koaLogger.default)());
}

app.use((0, _koaBodyparser.default)({
  onerror(err, ctx) {
    ctx.throw('Error parsing the body information', 422);
  }

}));
app.use((0, _koaStatic.default)(_path.default.resolve('dist')));
app.use(_handlers.default);
app.use(_routes.default);

const server = _http.default.Server(app.callback());

(0, _socketHandler.default)(server);
server.listen(_consts.PORT, () => {
  console.log('Serve running at http://' + _consts.IP + ':' + _consts.PORT);
});
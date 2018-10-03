"use strict";

exports.__esModule = true;
exports.default = void 0;

var _koaRouter = _interopRequireDefault(require("koa-router"));

var _consts = require("./consts");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = new _koaRouter.default({
  prefix: '/api'
});
router.get('/info', ctx => {
  ctx.body = {
    ip: _consts.IP,
    port: _consts.PORT
  };
});

var _default = router.routes();

exports.default = _default;
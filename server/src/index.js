import path from 'path'
import http from 'http'
import koa from 'koa'
import logger from 'koa-logger'
import bodyparser from 'koa-bodyparser'
import serve from 'koa-static'
import { PORT, KEYS, DEV, IP } from './consts'

import handlers from './handlers'
import routes from './routes'
import socketHandler from './socketHandler'

// APP
const app = new koa()
app.keys = KEYS

// LOGGING
if (DEV) {
  app.use(logger())
}

// BODY PARSER
app.use(bodyparser({
  onerror (err, ctx) {
    ctx.throw('Error parsing the body information', 422)
  }
}))

// STATIC FILES
app.use(serve(path.resolve('dist')))

// HANDLERS
app.use(handlers)

// ROUTES
app.use(routes)

const server = http.Server(app.callback())

// SOCKET
socketHandler(server)

// LISTEN
server.listen(PORT, () => {
  console.log('Serve running at http://' + IP + ':' + PORT)
})

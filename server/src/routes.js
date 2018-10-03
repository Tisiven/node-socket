import Router from 'koa-router'
import { PORT, IP } from './consts'

const router = new Router({
  prefix: '/api'
})

// router start
router.get('/info', (ctx) => {
  ctx.body = {
    ip: IP,
    port: PORT
  }
})

export default router.routes()

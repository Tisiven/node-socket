export default async (ctx, next) => {
  await next()

  if (!/^\/api\//.test(ctx.url)) return

  let body = ctx.body || {}
  let status = ctx.status
  let type = typeof body

  ctx.status = 200
  ctx.body = {
    success: status === 200,
    code: status
  }

  if (type === 'object') {
    ctx.body.msg = 'success'
    ctx.body.result = body
  } else if (type === 'string') {
    ctx.body.msg = body
    ctx.body.result = {}
  } else {
    ctx.body.msg = 'not found'
    ctx.body.result = {}
  }

  if (ctx.method === 'GET' && ctx.query.callback) {
    ctx.body = `/**/typeof ${ctx.query.callback} === "function" && ${ctx.query.callback}(${JSON.stringify(ctx.body)})`
  }
}

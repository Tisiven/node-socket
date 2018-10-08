import request from '@axe/request'
import modal from '@axe/modal'

const cache = {}

request.defaults.beforeRequest = req => {
  // 正在请求中则取消，防止频繁触发请求
  if (!cache[req.url]) {
    cache[req.url] = true
  } else {
    req._abort = true
  }
}

request.defaults.afterResponse = res => {
  cache[res.reqInfo.url] = false

  if (res.status < 200 && res.status >= 300) {
    modal.show({
      title: '请求出错',
      content: '可能情况：1.网络断开；2.服务器出错',
      confirmText: '知道了'
    })
  } else {
    let response = res.response || {}

    if (response.success) {
      res.response = response.result
    } else {
      modal.show({
        title: '请求信息',
        content: [response.code, response.msg].join(': '),
        confirmText: '知道了'
      })
    }
  }
}

export default request

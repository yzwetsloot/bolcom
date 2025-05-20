import got from 'got'

import config from '../config.js'
import { shuffle } from '../util/util.js'

const endpoint = ''

const fetchProxies = async (): Promise<string[]> => {
  const response = await got.get(endpoint)

  const body = response.body

  let proxies = body.split('\r\n')
  proxies = proxies.slice(0, -1)

  proxies = proxies.map((line) => line.replace(`:${config.proxy.username}:${config.proxy.password}`, ''))

  return proxies
}

let proxies = await fetchProxies()

// take subset of proxies [CUSTOM]
proxies = proxies.slice(0, 800)

shuffle(proxies)

const getProxy = (): string => {
  const proxy = proxies.shift()
  if (!proxy) throw Error('Proxy queue empty')

  proxies.push(proxy)

  return proxy
}

const removeProxy = (proxy: string) => {
  const index = proxies.indexOf(proxy)
  if (index > -1) proxies.splice(index, 1)
}

export { getProxy, removeProxy }

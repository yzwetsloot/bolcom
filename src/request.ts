import got, { Got, Response } from 'got'
import { CookieJar } from 'tough-cookie'
import { HttpsProxyAgent } from 'hpagent'

import config from './config.js'
import { getProxy, removeProxy } from './service/proxy.js'
import logger from './service/log.js'

type RequestMethod = 'get' | 'post' | 'put' | 'patch' | 'head' | 'delete'

class Client {
  private client: Got
  private proxy: string

  constructor() {
    this.proxy = getProxy()

    const agent = this.configureProxy()

    this.client = got.extend({
      prefixUrl: config.baseURL,
      timeout: {
        request: config.timeout,
      },
      retry: {
        limit: config.retryCount,
      },
      cookieJar: new CookieJar(),
      agent: {
        https: agent,
      },
      throwHttpErrors: false,
    })
  }

  async request(method: RequestMethod, url: string, ...args: any[]): Promise<Response<string> | null> {
    logger.debug(`${method.toUpperCase()} /${url}`)

    let response: Response<string> | null = null

    try {
      response = await this.client[method](url, ...args)
    } catch (error) {
      logger.error('Request error: %s', error)
      return null // retry
    }

    // handle IP block
    if (response.statusCode === 403 || response.statusCode === 429) {
      logger.warn('Proxy %s is blocked (status code: %d)', this.proxy, response.statusCode)

      // remove proxy from queue
      removeProxy(this.proxy)
      return null // retry
    }

    // handle non-200 status codes
    if (response.statusCode !== 200) {
      logger.warn('[%s] Got status code %d for %s', this.proxy, response.statusCode, '/' + url)
      return null // retry
    }

    return response
  }

  private configureProxy(): HttpsProxyAgent {
    logger.debug('Using proxy %s', this.proxy)

    const proxyConfig = {
      proxy: `http://${config.proxy.username}:${config.proxy.password}@${this.proxy}`,
    }

    const agent = new HttpsProxyAgent(proxyConfig)

    return agent
  }
}

export default Client

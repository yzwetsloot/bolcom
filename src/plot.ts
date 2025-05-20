import { spawn } from 'child_process'

import logger from './service/log.js'

const plot = async (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const process = spawn('python3', ['plot.py', id])

    process.on('close', (code) => {
      if (code === 0) {
        logger.debug("[%s] 'plot.py' exited with code 0", id)
        resolve()
      } else {
        logger.error("[%s] 'plot.py' exited with code %d", id, code)
        reject()
      }
    })

    process.stdout.on('data', (data) => {
      logger.debug('[%s] plot.py: %s', id, data)
    })

    process.stderr.on('data', (error) => {
      logger.error('[%s] plot.py: %s', id, error)
      reject(error)
    })
  })
}

export default plot

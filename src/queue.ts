import { Queue } from 'modern-async'

import { readLines } from './util/util.js'
import config from './config.js'
import worker from './worker.js'
import logger from './service/log.js'

const categories = readLines('resources/categories.txt')

class WorkerQueue {
  private queue: Queue
  private tasks: Array<Promise<void>>

  constructor() {
    this.queue = new Queue(config.taskConcurrency)
    this.tasks = []
  }

  add(url: string, page: number = 1) {
    const task = this.queue.exec(async () =>
      worker(url, page).catch((error) => {
        logger.error('Error while processing %s: %s', url + page, error)
      }),
    )
    this.tasks.push(task)
  }

  initialize() {
    for (const category of categories) this.add(category)
  }

  async execute() {
    await Promise.all(this.tasks)
  }
}

const workerQueue = new WorkerQueue()

workerQueue.initialize()

export default workerQueue

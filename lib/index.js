'use strict'

const Bluebird = require('bluebird')
const debug = require('debug')('async-workflow')

module.exports = class Runner {
  constructor(workflow, options) {
    if (!workflow) {
      throw new Error('Invalid workflow specified')
    }

    options = options || {}

    this.options = options
    this.workflow = workflow
    this.results = []
  }

  /**
   * Start the execution of the workflow tasks.
   *
   */
  async start() {
    const startTaskId = this.workflow.startTaskId

    if (!startTaskId) {
      throw new Error('`startTaskId` must be specified')
    }

    const startTask = this.getTask(startTaskId)

    if (!startTask) {
      throw new Error('Invalid workflow - start task not found')
    }

    await this.runTask(startTask)
    return this.finish()
  }

  /**
   * Run a given task
   */
  async runTask(task) {
    if (task.tasks) {
      debug(`runTask: running parallel tasks '${task._id}'`)
      // group of parallel tasks
      await this.runParallelTask(task)
      return Bluebird.resolve()
    }

    // single task
    try {
      debug(`runTask: running single task '${task._id}'`)
      const result = await this.run(task)

      this.results.push(`${task._id}:success:${result}`)
      let successResult

      if (task.successTaskId) {
        debug(`runTask: '${task._id}' succeded, continuing to '${task.successTaskId}'`)
        successResult = await this.runTask(this.getTask(task.successTaskId))
        debug(`runTask: '${task.successTaskId}' succeded, no continuing task available.`)
        debug(`runTask: '${task.successTaskId}' succeded, result '${successResult}'`)
      }

      return Bluebird.resolve(successResult)
    } catch (err) {
      this.results.push(`${task._id}:failure:${err}`)
      debug(`runTask: '${task._id}' failed error: ${err}`)

      if (task.failureTaskId) {
        debug(`runTask: '${task._id}' failed, continuing to '${task.failureTaskId}'`)
        await this.runTask(this.getTask(task.failureTaskId))
      } else {
        debug(`runTask: '${task._id}' failed, no continuing task available.`)
        return Bluebird.reject(err)
      }
    }
  }

  async runParallelTask(task) {
    const taskKeys = Object.keys(task.tasks)

    try {
      await Bluebird.all(taskKeys.map(key => {
        const parallelTask = this.getTask(key, task.tasks)
        return this.runTask(parallelTask)
      }))

      if (task.successTaskId) {
        return await this.runTask(this.getTask(task.successTaskId))
      }

      return Bluebird.resolve()
    } catch (err) {
      this.results.push(err)

      if (task.failureTaskId) {
        await this.runTask(this.getTask(task.failureTaskId))
      } else {
        return Bluebird.reject(err)
      }
    }
  }

  async run(task) {
    return task.fn(task.options)
  }

  async finish() {
    return Bluebird.resolve(this.results)
  }

  getTask(id, source) {
    source = source || this.workflow.tasks || {}
    const task = source[id]

    if (task) {
      task._id = id
    }

    return task
  }
}

'use strict'

const Bluebird = require('bluebird')

module.exports = class Runner {
  constructor(workflow, options) {
    if (!workflow) {
      throw new Error('Invalid workflow specified')
    }

    options = options || {}

    this.workflow = workflow
    this.results = []
  }

  /**
   * Start the execution of the workflow tasks.
   *
   */
  async start() {
    const startTask = this.getTask(this.workflow.startTaskId)

    if (!startTask) {
      throw new Error('Invalid workflow - missing start task')
    }

    await this.runTask(startTask)
    return this.finish()
  }

  /**
   * Run a given task
   */
  async runTask(task) {
    if (task.tasks) {
      // group of parallel tasks
      await this.runParallelTask(task)
      return Bluebird.resolve()
    }

    // single task
    try {
      const result = await this.run(task)

      this.results.push(result)

      if (task.successTaskId) {
        return await this.runTask(this.getTask(task.successTaskId))
      }

      return Bluebird.resolve()
    } catch (err) {
      if (task.failureTaskId) {
        const failureResult = await this.runTask(this.getTask(task.failureTaskId))
        this.results.push(failureResult)
      } else {
        return Bluebird.reject(err)
      }
    }
  }

  async runParallelTask(task) {
    const taskKeys = Object.keys(task.tasks)

    try {
      await Bluebird.all(taskKeys.map(key => this.runTask(task.tasks[key])))

      if (task.successTaskId) {
        return await this.runTask(this.getTask(task.successTaskId))
      }

      return Bluebird.resolve()
    } catch (err) {
      if (task.failureTaskId) {
        const failureResult = await this.runTask(this.getTask(task.failureTaskId))
        this.results.push(failureResult)
      } else {
        return Bluebird.reject(err)
      }
    }
  }

  async run(task) {
    return task.fn()
  }

  async finish() {
    return Bluebird.resolve(this.results)
  }

  getTask(id) {
    return this.workflow.tasks[id]
  }
}

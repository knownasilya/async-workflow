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
  start() {return __async(function*(){
    const startTask = this.getTask(this.workflow.startTaskId)

    if (!startTask) {
      throw new Error('Invalid workflow - missing start task')
    }

    yield this.runTask(startTask)
    return this.finish()
  }.call(this))}

  /**
   * Run a given task
   */
  runTask(task) {return __async(function*(){
    if (task.tasks) {
      // group of parallel tasks
      yield this.runParallelTask(task)
      return Bluebird.resolve()
    }

    // single task
    try {
      const result = yield this.run(task)

      this.results.push(result)

      if (task.successTaskId) {
        return yield this.runTask(this.getTask(task.successTaskId))
      }

      return Bluebird.resolve()
    } catch (err) {
      if (task.failureTaskId) {
        const failureResult = yield this.runTask(this.getTask(task.failureTaskId))
        this.results.push(failureResult)
      } else {
        return Bluebird.reject(err)
      }
    }
  }.call(this))}

  runParallelTask(task) {return __async(function*(){
    const taskKeys = Object.keys(task.tasks)

    try {
      yield Bluebird.all(taskKeys.map(key => this.runTask(task.tasks[key])))

      if (task.successTaskId) {
        return yield this.runTask(this.getTask(task.successTaskId))
      }

      return Bluebird.resolve()
    } catch (err) {
      if (task.failureTaskId) {
        const failureResult = yield this.runTask(this.getTask(task.failureTaskId))
        this.results.push(failureResult)
      } else {
        return Bluebird.reject(err)
      }
    }
  }.call(this))}

  run(task) {return __async(function*(){
    return task.fn()
  }())}

  finish() {return __async(function*(){
    return Bluebird.resolve(this.results)
  }.call(this))}

  getTask(id) {
    return this.workflow.tasks[id]
  }
}

function __async(g){return new Promise(function(s,j){function c(a,x){try{var r=g[x?"throw":"next"](a)}catch(e){return j(e)}return r.done?s(r.value):Promise.resolve(r.value).then(c,d)}function d(e){return c(e,1)}c()})}

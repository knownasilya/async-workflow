'use strict'

const Bluebird = require('bluebird')

module.exports = {
  startTaskId: 'clone',
  tasks: {
    clone: {
      fn() {
        return Bluebird.resolve('clone')
      },
      successTaskId: 'install',
      failureTaskId: 'cleanup'
    },

    install: {
      fn() {
        return Bluebird.reject('install failed')
      },
      successTaskId: 'test',
      failureTaskId: 'cleanup'
    },

    test: {
      fn() {
        return Bluebird.resolve('test')
      },
      successTaskId: 'deploy',
      failureTaskId: 'cleanup'
    },

    deploy: {
      fn() {
        return Bluebird.resolve('deploy')
      }
    },

    cleanup: {
      fn() {
        return Bluebird.resolve('cleanup')
      }
    }
  }
}

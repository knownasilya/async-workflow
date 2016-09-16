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
      tasks: {
        installA: {
          fn() {
            return new Bluebird((resolve) => {
              setTimeout(() => {
                resolve('installA')
              }, 300)
            })
          }
        },
        installB: {
          fn() {
            return new Bluebird((resolve, reject) => {
              setTimeout(() => {
                reject('failed installB')
              }, 100)
            })
          }
        }
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

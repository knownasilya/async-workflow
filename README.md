# async-workflow

Run JSON based workflows

[![Build Status](https://travis-ci.org/knownasilya/async-workflow.svg?branch=master)](https://travis-ci.org/knownasilya/async-workflow)

## Example

```js
const Bluebird = require('bluebird')
const Runner = require('async-workflow')

const runner = new Runner({
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
        return Bluebird.resolve('install')
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
})

const results = await runner.start()
```

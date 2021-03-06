# async-workflow

Run JSON based workflows

[![npm](https://img.shields.io/npm/v/async-workflow.svg?maxAge=2592000?style=flat-square)](http://npmjs.com/package/async-workflow)
[![Travis branch](https://img.shields.io/travis/knownasilya/async-workflow/master.svg?maxAge=2592000?style=flat-square)](https://travis-ci.org/knownasilya/async-workflow)
[![Coveralls branch](https://img.shields.io/coveralls/knownasilya/async-workflow/master.svg?maxAge=2592000?style=flat-square)](https://coveralls.io/github/knownasilya/async-workflow)

## Example

```js
const Bluebird = require('bluebird')
const Runner = require('async-workflow')

const runner = new Runner({
  startTaskId: 'clone',
  tasks: {
    clone: {
      fn(options) {
        return Bluebird.resolve('clone')
      },
      options: {
        repo: 'knownasilya/async-workflow'
      },
      successTaskId: 'install',
      failureTaskId: 'cleanup'
    },

    install: {
      // Run in parallel
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
            return new Bluebird((resolve) => {
              setTimeout(() => {
                resolve('installB')
              }, 100)
            })
          }
        }
      },
      // Run once all pass or any fail
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

## TODO

- [x] Test parallel tasks
- [ ] Figure out how results should be formatted/passed along
- [ ] Time tasks
- [ ] docker shell run

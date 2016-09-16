'use strict'

const test = require('ava')
const Runner = require('../lib')

test('All pass', async t => {
  const workflow = require('./fixtures/all-pass')

  const runner = new Runner(workflow)
  const results = await runner.start()

  console.log(results)
  t.is(results.length, 4, 'Right number of tasks pass')
})

test('One failure', async t => {
  const workflow = require('./fixtures/one-failure')

  const runner = new Runner(workflow)
  const results = await runner.start()

  console.log(results)
  t.is(results.length, 3, 'Right number of tasks pass')
})

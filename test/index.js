'use strict'

const test = require('ava')
const Runner = require('../lib')

test('All pass', async t => {
  const allPassWorkflow = require('./fixtures/all-pass')

  const runner = new Runner(allPassWorkflow)
  const results = await runner.start()

  console.log(results)
  t.is(results.length, 4, 'Right number of tasks pass')
})

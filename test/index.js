'use strict'

const test = require('ava')
const Runner = require('../lib')

test('requires workflow', t => {
  t.throws(() => {
    const runner = new Runner()
    console.log(runner)
  }, 'Invalid workflow specified', 'Throws on invalid workflow')
})

test('workflow requires startTaskId', async t => {
  const runner = new Runner({})

  t.throws(runner.start(), '`startTaskId` must be specified',
    'Throws on invalid')
})

test('workflow requires startTask', async t => {
  const runner = new Runner({startTaskId: 'a'})

  t.throws(runner.start(), 'Invalid workflow - start task not found',
    'Throws on invalid')
})

test('All pass', async t => {
  const workflow = require('./fixtures/all-pass')

  const runner = new Runner(workflow)
  const results = await runner.start()

  console.log(results)
  t.is(results.length, 4, 'Right number of tasks pass')
})

test('All pass - parallel', async t => {
  const workflow = require('./fixtures/all-pass-parallel')

  const runner = new Runner(workflow)
  const results = await runner.start()

  console.log(results)
  t.is(results.length, 5, 'Right number of tasks pass')
})

test('One failure', async t => {
  const workflow = require('./fixtures/one-failure')

  const runner = new Runner(workflow)
  const results = await runner.start()

  console.log(results)
  t.is(results.length, 3, 'Right number of tasks pass')
})

#!/usr/bin/env node
/*
Copyright 2016, Yahoo Inc.
Code licensed under the MIT License.
See LICENSE.txt
*/
var argv = require('yargs')
  .usage('Usage: $0 -r username/repo -s YYYY-MM-DD -u YYY-MM-DD')
  .describe('verbose', 'Output a bunch of debug info')
  .alias('v', 'verbose')
  .boolean('verbose')
  .describe('repo', 'The github repo as username/repo')
  .alias('r', 'repo')
  .string('repo')
  .demand('repo')
  .describe('username', 'Your github username, if authenticating')
  .alias('U', 'username')
  .string('username')
  .describe('password', 'Your github password, if authenticating')
  .alias('P', 'password')
  .string('password')
  .implies('username', 'password')
  .implies('password', 'username')
  .describe('since', 'First commit time (passed to `Date()`)')
  .alias('s', 'since')
  .string('since')
  .demand('since')
  .describe('until', 'Last commit time (passed to `Date()`)')
  .alias('u', 'until')
  .string('until')
  .describe('components', 'Shows breakdowns of commits by component')
  .boolean('components')
  .alias('c', 'components')
  .help('help', 'Shows this')
  .argv

if (argv.verbose) {
  if (process.env.DEBUG) {
    process.env.DEBUG += ',contrib'
  } else {
    process.env.DEBUG = 'contrib'
  }
}
var debug = require('debug')('contrib')

var github = new (require('github'))({
  version: '3.0.0',
  headers: {
    'user-agent': 'contribution-report'
  }
})

var userAndRepo = argv.repo.split('/')
var user = userAndRepo[0]
var repo = userAndRepo[1]

if (argv.username && argv.password) {
  github.authenticate({
    type: 'basic',
    username: argv.username,
    password: argv.password
  })
}

var results = []

function getPage (n) {
  var msg = {
    user: user,
    repo: repo,
    per_page: 100,
    page: n,
    since: new Date(argv.since).toISOString()
  }
  if (argv.until) {
    msg.until = new Date(argv.until).toISOString()
  }
  if (argv.path) {
    msg.path = argv.path
  }
  debug('get-page', 'getting page', n, 'with options:', msg)

  github.repos.getCommits(msg, function (err, data) {
    if (err) {
      console.log(err.stack)
      throw err
    }
    debug('get-page', 'got page', n, 'with', data.length, 'commits')
    results = results.concat(data)
    if (data.length < 100) {
      analyze(results)
    } else {
      getPage(n + 1)
    }
  })
}

function analyze (list) {
  debug('analyze', 'analyzing', list.length, 'commits')
  var condensed = {}
  list.forEach(function (commit) {
    var author = commit.author ? commit.author.login : commit.committer.login
    if (!condensed[author]) {
      condensed[author] = []
    }
    condensed[author].push(commit.commit.message)
  })
  Object.keys(condensed).sort(function (a, b) {
    return condensed[b].length - condensed[a].length
  }).forEach(function (item) {
    console.log('* @' + item, condensed[item].length, 'commits')
    if (argv.components) {
      var types = {}
      condensed[item].forEach(function (msg) {
        var prefix = msg.split(':')[0].trim()
        if (prefix.length < 15) { // filter out other uses of `:`
          if (!types[prefix]) {
            types[prefix] = 1
          } else {
            types[prefix]++
          }
        }
      })
      var typeStrings = Object.keys(types).sort(function (a, b) {
        return types[a] - types[b]
      }).map(function (n) {
        return types[n] + ' to `' + n + '`'
      }).join(', ')
      if (typeStrings.length) {
        console.log('  *', typeStrings)
      }
    }
  })
}

getPage(0)

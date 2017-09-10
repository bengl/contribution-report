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
  .describe('token', 'Your GitHub API token, if authenticating')
  .alias('T', 'token')
  .string('token')
  .describe('username', 'Your GitHub username, if authenticating')
  .alias('U', 'username')
  .string('username')
  .describe('password', 'Your GitHub password, if authenticating')
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
  .describe('collaborators', 'Highlight collaborators (requires push access)')
  .alias('C', 'collaborators')
  .boolean('collaborators')
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

if (argv.token || process.env.GITHUB_TOKEN) {
  github.authenticate({
    type: 'token',
    token: argv.token
  })
} else if (argv.username && argv.password) {
  github.authenticate({
    type: 'basic',
    username: argv.username,
    password: argv.password
  })
}

var collaborators = []

function getCommits (callback) {
  var msg = {
    user: user,
    repo: repo,
    per_page: 100,
    since: new Date(argv.since).toISOString()
  }
  if (argv.until) {
    msg.until = new Date(argv.until).toISOString()
  }
  if (argv.path) {
    msg.path = argv.path
  }

  const scope = {
    method: github.repos.getCommits,
    msg: msg,
    callback: callback,
    results: []
  }

  getPage.call(scope, 0)
}

function getCollaborators (callback) {
  var msg = {
    user: user,
    repo: repo,
    per_page: 100
  }

  const scope = {
    method: github.repos.getCollaborators,
    msg: msg,
    callback: callback,
    results: []
  }

  getPage.call(scope, 0)
}

function getPage (n) {
  var self = this
  self.msg.page = n

  debug('get-page', 'getting page', n, 'with options:', self.msg)

  self.method(self.msg, function (err, data) {
    if (err) {
      console.log(err.stack)
      throw err
    }
    debug('get-page', 'got page', n, 'with', data.length, 'results')
    self.results = self.results.concat(data)
    if (data.length < 100) {
      self.callback(self.results)
    } else {
      // FIXME: Date '2016-01-01T00:00:00.000Z' turns into '"2016-01-01T00:00:00.000Z"' on subsequent calls. WTF?
      if (self.msg.since) self.msg.since = self.msg.since.replace(/"/g, '')
      getPage.call(self, n + 1)
    }
  })
}

function analyze (list) {
  debug('analyze', 'analyzing', list.length, 'commits')
  if (argv.until) {
    console.log('%d commits in `%s` between %s and %s:', list.length, argv.repo, argv.since, argv.until)
  } else {
    console.log('%d commits in `%s` since %s:', list.length, argv.repo, argv.since)
  }
  var condensed = {}
  list.forEach(function (commit) {
    var author = commit.author && commit.author.login
    var committer = commit.committer && commit.committer.login
    var contributor = author || committer || 'unknown'

    if (!condensed[contributor]) {
      condensed[contributor] = []
    }
    condensed[contributor].push(commit.commit.message)
  })

  Object.keys(condensed)
    .sort(function (a, b) {
      return condensed[b].length - condensed[a].length
    })
    .forEach(function (item) {
      var collab = collaborators.indexOf(item) !== -1 ? '(is a collaborator)' : ''
      console.log('* @%s %d commits %s', item, condensed[item].length, collab)
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

if (argv.collaborators) {
  getCollaborators(function (collab) {
    collaborators = collab.map(function (c) { return c.login })

    getCommits(analyze)
  })
} else {
  getCommits(analyze)
}

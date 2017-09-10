# contribution-report

This generates a simple contribution report, by username, for a GitHub
repositiory.

## Usage

```
$ npm i -g contribution-report
$ contribution-report --help
```

### Examples

```bash
# Get contributor list with components
$ contribution-report -c -r nodejs/node -s 2015-10-05 -u 2015-10-12

66 commits in `nodejs/node` between 2015-10-05 and 2015-10-12:
* @Trott 11 commits
  * 1 to `lib,test`, 1 to `tools`, 1 to `lib`, 8 to `test`
* @indutny 6 commits
  * 1 to `buffer`, 1 to `stream_wrap`, 1 to `http_server`, 3 to `http`
* @trevnorris 5 commits
  * 1 to `js_stream`, 1 to `async_wrap`, 3 to `buffer`
* @evanlucas 4 commits
  * 1 to `test`, 3 to `util`
* @skomski 4 commits
  * 1 to `test`, 3 to `src`
…
```

```bash
# Get collaborators (requires push access to the repo)
$ contribution-report -C -r nodejs/nodejs.org -s 2015-10-05 -u 2015-10-12 \
  -U <GitHub user> -P <GitHub access token>

43 commits in `nodejs/nodejs.org` between 2015-10-05 and 2015-10-12:
* @fhemberger 9 commits (is a collaborator)
* @mikeal 7 commits (is a collaborator)
* @phillipj 6 commits (is a collaborator)
* @Trott 4 commits (is a collaborator)
* @greenkeeperio-bot 3 commits
…
```

## License

MIT License. See LICENSE.txt

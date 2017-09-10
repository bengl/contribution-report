var exec = require('child_process').exec

var expected = '66 commits in `nodejs/node` between 2015-10-05 and 2015-10-12:\n* @Trott 11 commits \n  * 1 to `lib,test`, 1 to `tools`, 1 to `lib`, 8 to `test`\n* @indutny 6 commits \n  * 1 to `buffer`, 1 to `stream_wrap`, 1 to `http_server`, 3 to `http`\n* @trevnorris 5 commits \n  * 1 to `js_stream`, 1 to `async_wrap`, 3 to `buffer`\n* @evanlucas 4 commits \n  * 1 to `test`, 3 to `util`\n* @skomski 4 commits \n  * 1 to `test`, 3 to `src`\n* @srl295 3 commits \n  * 1 to `doc`, 2 to `build`\n* @jasnell 3 commits \n  * 1 to `test`, 2 to `http`\n* @silverwind 3 commits \n  * 1 to `doc`, 2 to `test`\n* @bnoordhuis 3 commits \n  * 1 to `assert`, 1 to `tools`, 1 to `module`\n* @ofrobots 2 commits \n  * 1 to `Revert "deps`, 1 to `deps`\n* @rvagg 2 commits \n  * 1 to `doc`\n* @a0viedo 2 commits \n  * 2 to `doc`\n* @galambalazs 1 commits \n  * 1 to `doc`\n* @john-yan 1 commits \n  * 1 to `test`\n* @reggi 1 commits \n  * 1 to `doc`\n* @daveboivin 1 commits \n  * 1 to `doc`\n* @jbergstroem 1 commits \n  * 1 to `build`\n* @dougshamoo 1 commits \n  * 1 to `doc`\n* @zkat 1 commits \n  * 1 to `deps`\n* @kapouer 1 commits \n  * 1 to `build`\n* @romankl 1 commits \n  * 1 to `doc`\n* @jasonkarns 1 commits \n  * 1 to `doc`\n* @MJefferson 1 commits \n  * 1 to `doc`\n* @TooTallNate 1 commits \n  * 1 to `tools`\n* @rodmachen 1 commits \n  * 1 to `doc`\n* @dhodder 1 commits \n  * 1 to `doc`\n* @mscdex 1 commits \n  * 1 to `stream`\n* @thefourtheye 1 commits \n  * 1 to `module`\n* @whitlockjc 1 commits \n  * 1 to `src`\n* @misterdjules 1 commits \n  * 1 to `deps`\n'

exec('node index -c -r nodejs/node -s 2015-10-05 -u 2015-10-12', function (err, data) {
  console.assert(!err)
  console.assert(data === expected)
  console.log('test passed')
})

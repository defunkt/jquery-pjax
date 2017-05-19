var fs = require('fs')
var suites = require('system').args.slice(1)

function print(s) {
  fs.write('/dev/stdout', s, 'w')
}

var page = require('webpage').create()
page.onConsoleMessage = function(msg) {
  console.log(msg)
}
page.onError = function(msg) {
  console.error('ERROR: ' + msg)
}

var timeoutId = null
function deferTimeout() {
  if (timeoutId) clearTimeout(timeoutId)
  timeoutId = setTimeout(function() {
    console.error('Timeout')
    phantom.exit(1)
  }, 3000)
}

var endresult = 0

function runSuite() {
  var suite = suites.shift()
  if (!suite) {
    phantom.exit(endresult)
    return
  }

  page.open(suite, function() {
    deferTimeout()

    var interval = setInterval(function() {
      var tests = page.evaluate(function() {
        var results = []
        var els = document.getElementById('qunit-tests').children

        for (var i = 0; i < els.length; i++) {
          var test = els[i]
          if (test.className !== 'running' && !test.recorded) {
            test.recorded = true
            if (test.className === 'pass') results.push('.')
            else if (test.className === 'fail') results.push('F')
          }
        }

        return results
      })

      for (var i = 0; i < tests.length; i++) {
        deferTimeout()
        print(tests[i])
      }

      var result = page.evaluate(function() {
        var testresult = document.getElementById('qunit-testresult')
        var els = document.getElementById('qunit-tests').children

        if (testresult.innerText.match(/completed/)) {
          console.log('')

          for (var i = 0; i < els.length; i++) {
            var test = els[i]
            if (test.className === 'fail') {
              console.error(test.innerText)
            }
          }

          console.log(testresult.innerText)
          return parseInt(testresult.getElementsByClassName('failed')[0].innerText)
        }
      })

      if (result != null) {
        endresult = result
        clearInterval(interval)
        runSuite()
      }
    }, 100)
  })
}

runSuite()

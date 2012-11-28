fs = require 'fs'
print = (s) -> fs.write "/dev/stderr", s, 'w'

page = new WebPage()
page.onConsoleMessage = (msg) -> console.error msg

timeoutId = null
deferTimeout = ->
  clearTimeout timeoutId if timeoutId
  timeoutId = setTimeout ->
    console.error "Timeout"
    phantom.exit 1
  , 3000

exited = false
page.open phantom.args[0], ->
  deferTimeout()

  setInterval ->
    return if exited

    tests = page.evaluate ->
      tests = document.getElementById('qunit-tests').children
      for test in tests when test.className isnt 'running' and not test.recorded
        test.recorded = true
        if test.className is 'pass'
          '.'
        else if test.className is 'fail'
          'F'

    for test in tests when test
      deferTimeout()
      print test

    result = page.evaluate ->
      result = document.getElementById('qunit-testresult')
      tests  = document.getElementById('qunit-tests').children

      if result.innerText.match /completed/
        console.error ""

        for test in tests when test.className is 'fail'
          console.error test.innerText

        console.error result.innerText
        return parseInt result.getElementsByClassName('failed')[0].innerText

      return

    if result?
      exited = true
      phantom.exit result

  , 100

// Navigation helper for the test iframe. Queues navigation actions and
// callbacks, then executes them serially with respect to async. This is to
// avoid deep nesting of callbacks in tests.
//
// After last successful navigation, asyncTest is automatically resumed.
//
// Usage:
//
//   navigate(this.frame)
//   .pjax(pjaxOptions, function(frame){ ... }
//   .back(-1, function(frame){ ... }
//
function navigate(frame) {
  var queue = []
  var api = {}

  api.pjax = function(options, callback) {
    queue.push([options, callback])
    return api
  }
  api.back = api.pjax

  var workOff = function() {
    var item = queue.shift()
    if (!item) {
      start()
      return
    }

    var target = item[0], callback = item[1]

    frame.$(frame.document).one("pjax:end", function() {
      if (callback) callback(frame)
      setTimeout(workOff, 0)
    })

    if (typeof target == "number") {
      frame.history.go(target)
    } else {
      frame.$.pjax(target)
    }
  }

  setTimeout(workOff, 0)

  return api
}

// Navigation helper for the test iframe. Queues navigation actions and
// callbacks, then executes them serially with respect to async. This is to
// avoid deep nesting of callbacks in tests.
//
// If a `then`able object is returned from a callback, then the navigation will
// resume only after the promise has been resolved.
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
      var promise = callback && callback(frame)
      if (promise && typeof promise.then == "function") promise.then(workOff)
      else setTimeout(workOff, 0)
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

// A poor man's Promise implementation. Only resolvable promises with no
// reject/catch support.
function PoorMansPromise(setup) {
  var result, callback, i = 0, callbacks = []
  setup(function(_result) {
    result = _result
    while (callback = callbacks[i++]) callback(result)
  })
  this.then = function(done) {
    if (i == 0) callbacks.push(done)
    else setTimeout(function(){ done(result) }, 0)
    return this
  }
}

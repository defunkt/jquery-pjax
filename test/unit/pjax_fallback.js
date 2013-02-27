// $.pjax fallback tests should run on both pushState and
// non-pushState compatible browsers.
$.each([true, false], function() {

var disabled = this == false
var s = disabled ? " (disabled)" : ""

module("$.pjax fallback"+s, {
  setup: function() {
    var self = this
    stop()
    this.loaded = function(frame) {
      self.frame  = frame
      self.loaded = $.noop
      start()
    }
    window.iframeLoad = function(frame) {
      setTimeout(function() {
        if (disabled && frame.$ && frame.$.pjax) frame.$.pjax.disable()
        self.loaded(frame)
      }, 0)
    }
    $("#qunit-fixture").append("<iframe src='home.html'>")
  },
  teardown: function() {
    delete window.iframeLoad
  }
})


asyncTest("sets new url"+s, function() {
  var frame = this.frame

  this.loaded = function() {
    equal(frame.location.pathname, "/hello.html")
    start()
  }

  frame.$.pjax({
    url: "hello.html",
    container: "#main"
  })
})

asyncTest("sets new url for function"+s, function() {
  var frame = this.frame

  this.loaded = function() {
    equal(frame.location.pathname, "/hello.html")
    start()
  }

  frame.$.pjax({
    url: function() { return "hello.html" },
    container: "#main"
  })
})

asyncTest("updates container html"+s, function() {
  var frame = this.frame

  this.loaded = function(frame) {
    equal(frame.$("#main p").html(), "Hello!")
    start()
  }

  frame.$.pjax({
    url: "/hello.html",
    container: "#main"
  })
})

asyncTest("sets title to response <title>"+s, function() {
  var frame = this.frame

  this.loaded = function(frame) {
    equal(frame.document.title, "Hello")
    start()
  }

  frame.$.pjax({
    url: "/hello.html",
    container: "#main"
  })
})

asyncTest("sends correct HTTP referer"+s, function() {
  var frame = this.frame

  this.loaded = function(frame) {
    var referer = frame.document.getElementById("referer").textContent
    ok(referer.match("/home.html"), referer)
    start()
  }

  frame.$.pjax({
    url: "/referer.html",
    container: "#main"
  })
})

asyncTest("adds entry to browser history"+s, function() {
  var frame = this.frame
  var count = 0

  frame.onpopstate = function() {
    window.iframeLoad(frame)
  }

  this.loaded = function() {
    count++

    if (count == 1) {
      equal(frame.location.pathname, "/hello.html")
      ok(frame.history.length > 1)
      frame.history.back()
    } else if (count == 2) {
      equal(frame.location.pathname, "/home.html")
      frame.history.forward()
      start()
    }
  }

  frame.$.pjax({
    url: "hello.html",
    container: "#main"
  })
})

asyncTest("scrolls to top of the page"+s, function() {
  var frame = this.frame

  frame.window.scrollTo(0, 100)
  equal(frame.window.scrollY, 100)

  this.loaded = function(frame) {
    equal(frame.window.scrollY, 0)
    start()
  }

  frame.$.pjax({
    url: "/long.html",
    container: "#main"
  })
})

asyncTest("scrolls to anchor at top page"+s, function() {
  var frame = this.frame

  equal(frame.window.scrollY, 0)

  this.loaded = function(frame) {
    setTimeout(function() {
      equal(frame.window.scrollY, 8)
      start()
    }, 100)
  }

  frame.$.pjax({
    url: "/anchor.html#top",
    container: "#main"
  })
})

asyncTest("empty anchor doesn't scroll page"+s, function() {
  var frame = this.frame

  equal(frame.window.scrollY, 0)

  this.loaded = function(frame) {
    setTimeout(function() {
      equal(frame.window.scrollY, 0)
      start()
    }, 10)
  }

  frame.$.pjax({
    url: "/anchor.html#",
    container: "#main"
  })
})

asyncTest("scrolls to anchor at bottom page"+s, function() {
  var frame = this.frame

  equal(frame.window.scrollY, 0)

  this.loaded = function(frame) {
    setTimeout(function() {
      equal(frame.window.scrollY, 10008)
      start()
    }, 10)
  }

  frame.$.pjax({
    url: "/anchor.html#bottom",
    container: "#main"
  })
})



asyncTest("sets GET method"+s, function() {
  var frame = this.frame

  this.loaded = function() {
    equal(frame.location.pathname, "/env.html")
    var env = JSON.parse(frame.$("#env").text())
    equal(env['REQUEST_METHOD'], "GET")
    start()
  }

  frame.$.pjax({
    type: 'GET',
    url: "env.html",
    container: "#main"
  })
})


asyncTest("sets POST method"+s, function() {
  var frame = this.frame

  this.loaded = function() {
    equal(frame.location.pathname, "/env.html")
    var env = JSON.parse(frame.$("#env").text())
    equal(env['REQUEST_METHOD'], "POST")
    start()
  }

  frame.$.pjax({
    type: 'POST',
    url: "env.html",
    container: "#main"
  })
})

asyncTest("sets PUT method"+s, function() {
  var frame = this.frame

  this.loaded = function() {
    equal(frame.location.pathname, "/env.html")
    var env = JSON.parse(frame.$("#env").text())
    equal(env['REQUEST_METHOD'], "PUT")
    start()
  }

  frame.$.pjax({
    type: 'PUT',
    url: "env.html",
    container: "#main"
  })
})

asyncTest("sets DELETE method"+s, function() {
  var frame = this.frame

  this.loaded = function() {
    equal(frame.location.pathname, "/env.html")
    var env = JSON.parse(frame.$("#env").text())
    equal(env['REQUEST_METHOD'], "DELETE")
    start()
  }

  frame.$.pjax({
    type: 'DELETE',
    url: "env.html",
    container: "#main"
  })
})


asyncTest("GET with data object"+s, function() {
  var frame = this.frame

  this.loaded = function() {
    equal(frame.location.pathname, "/env.html")
    equal(frame.location.search, "?foo=bar")

    var env = JSON.parse(frame.$("#env").text())
    equal(env['REQUEST_METHOD'], "GET")
    equal(env['rack.request.query_hash']['foo'], 'bar')

    start()
  }

  frame.$.pjax({
    type: 'GET',
    url: "env.html",
    data: {foo: 'bar'},
    container: "#main"
  })
})

asyncTest("POST with data object"+s, function() {
  var frame = this.frame

  this.loaded = function() {
    equal(frame.location.pathname, "/env.html")
    equal(frame.location.search, "")

    var env = JSON.parse(frame.$("#env").text())
    equal(env['REQUEST_METHOD'], "POST")
    equal(env['rack.request.form_hash']['foo'], 'bar')

    start()
  }

  frame.$.pjax({
    type: 'POST',
    url: "env.html",
    data: {foo: 'bar'},
    container: "#main"
  })
})

asyncTest("GET with data string"+s, function() {
  var frame = this.frame

  this.loaded = function() {
    equal(frame.location.pathname, "/env.html")
    equal(frame.location.search, "?foo=bar")

    var env = JSON.parse(frame.$("#env").text())
    equal(env['REQUEST_METHOD'], "GET")
    equal(env['rack.request.query_hash']['foo'], 'bar')

    start()
  }

  frame.$.pjax({
    type: 'GET',
    url: "env.html",
    data: "foo=bar",
    container: "#main"
  })
})

asyncTest("POST with data string"+s, function() {
  var frame = this.frame

  this.loaded = function() {
    equal(frame.location.pathname, "/env.html")
    equal(frame.location.search, "")

    var env = JSON.parse(frame.$("#env").text())
    equal(env['REQUEST_METHOD'], "POST")
    equal(env['rack.request.form_hash']['foo'], 'bar')

    start()
  }

  frame.$.pjax({
    type: 'POST',
    url: "env.html",
    data: "foo=bar",
    container: "#main"
  })
})

})

// $.pjax fallback tests should run on both pushState and
// non-pushState compatible browsers.
module("$.pjax fallback", {
  setup: function() {
    var self = this
    stop()
    this.loaded = function(frame) {
      self.frame  = frame
      self.loaded = $.noop
      start()
    }
    window.iframeLoad = function(frame) {
      setTimeout(function() { self.loaded(frame) }, 0)
    }
    $("#qunit-fixture").append("<iframe src='home.html'>")
  },
  teardown: function() {
    delete window.iframeLoad
  }
})


asyncTest("sets new url", function() {
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

asyncTest("sets new url for function", function() {
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

asyncTest("updates container html", function() {
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

asyncTest("sets title to response <title>", function() {
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

asyncTest("sends correct HTTP referer", function() {
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

asyncTest("adds entry to browser history", function() {
  var frame = this.frame
  var count = 0

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

asyncTest("scrolls to top of the page", function() {
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


asyncTest("sets GET method", function() {
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


asyncTest("sets POST method", function() {
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

asyncTest("sets PUT method", function() {
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

asyncTest("sets DELETE method", function() {
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


asyncTest("GET with data object", function() {
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

asyncTest("POST with data object", function() {
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

asyncTest("GET with data string", function() {
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

asyncTest("POST with data string", function() {
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

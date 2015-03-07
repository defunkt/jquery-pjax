// $.pjax fallback tests should run on both pushState and
// non-pushState compatible browsers.
$.each([true, false], function() {

var disabled = this == false
var s = disabled ? " (disabled)" : ""

var ua = navigator.userAgent
var safari = ua.match("Safari") && !ua.match("Chrome") && !ua.match("Edge")
var chrome = ua.match("Chrome") && !ua.match("Edge")

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
      equal(frame.location.pathname, "/anchor.html")
      equal(frame.location.hash, "#top")
      equal(frame.window.scrollY, 8)
      start()
    }, 100)
  }

  frame.$.pjax({
    url: "/anchor.html#top",
    container: "#main"
  })

  if (disabled) {
    equal(frame.location.pathname, "/home.html")
    equal(frame.location.hash, "")
  } else {
    equal(frame.location.pathname, "/anchor.html")
    equal(frame.location.hash, "#top")
  }
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

asyncTest("scrolls to named encoded anchor"+s, function() {
  var frame = this.frame

  equal(frame.window.scrollY, 0)

  this.loaded = function(frame) {
    setTimeout(function() {
      equal(frame.window.scrollY, 10008)
      start()
    }, 10)
  }

  frame.$.pjax({
    url: "/anchor.html#%62%6F%74%74%6F%6D",
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

asyncTest("GET with data array"+s, function() {
  var frame = this.frame

  this.loaded = function() {
    equal(frame.location.pathname, "/env.html")
    equal(frame.location.search, "?foo%5B%5D=bar&foo%5B%5D=baz")

    var env = JSON.parse(frame.$("#env").text())
    equal(env['REQUEST_METHOD'], "GET")
    var expected = {'foo': ['bar', 'baz']};
    if (!disabled) expected._pjax = "#main"
    deepEqual(env['rack.request.query_hash'], expected)

    start()
  }

  frame.$.pjax({
    type: 'GET',
    url: "env.html",
    data: [{name: "foo[]", value: "bar"}, {name: "foo[]", value: "baz"}],
    container: "#main"
  })
})

asyncTest("POST with data array"+s, function() {
  var frame = this.frame

  this.loaded = function() {
    equal(frame.location.pathname, "/env.html")
    equal(frame.location.search, "")

    var env = JSON.parse(frame.$("#env").text())
    equal(env['REQUEST_METHOD'], "POST")
    var expected = {'foo': ['bar', 'baz']};
    if (!disabled) expected._pjax = "#main"
    deepEqual(env['rack.request.form_hash'], expected)

    start()
  }

  frame.$.pjax({
    type: 'POST',
    url: "env.html",
    data: [{name: "foo[]", value: "bar"}, {name: "foo[]", value: "baz"}],
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

asyncTest("handle form submit"+s, function() {
  var frame = this.frame

  frame.$(frame.document).on("submit", "form", function(event) {
    frame.$.pjax.submit(event, "#main")
  })

  this.loaded = function() {
    var env = JSON.parse(frame.$("#env").text())
    var expected = {foo: "1", bar: "2"}
    if (!disabled) expected._pjax = "#main"
    deepEqual(env['rack.request.query_hash'], expected)
    start()
  }

  frame.$("form").submit()
})

asyncTest("browser URL is correct after redirect"+s, function() {
  var frame = this.frame

  this.loaded = function() {
    equal(frame.location.pathname, "/hello.html")
    var expectedHash = safari && disabled ? "" : "#new"
    equal(frame.location.hash, expectedHash)
    start()
  }

  frame.$.pjax({
    url: "redirect.html#new",
    container: "#main"
  })
})

asyncTest("server can't affect anchor after redirect"+s, function() {
  var frame = this.frame

  this.loaded = function() {
    equal(frame.location.pathname, "/hello.html")
    var expectedHash = safari && disabled ? "" : "#new"
    equal(frame.location.hash, expectedHash)
    start()
  }

  frame.$.pjax({
    url: "redirect.html?anchor=server#new",
    container: "#main"
  })
})

})

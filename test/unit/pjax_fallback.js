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
    $("#qunit-fixture").append("<iframe src='iframe.html'>")
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

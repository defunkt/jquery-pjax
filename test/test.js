module("$.pjax", {
  setup: function() {
    var self = this
    stop()
    window.iframeReady = function(frame) {
      self.frame = frame
      start()
    }
    $("#qunit-fixture").append("<iframe src='/iframe'>")
  },
  teardown: function() {
    delete window.iframeReady
  }
})


asyncTest("pushes new url", function() {
  var frame = this.frame

  frame.$.pjax({
    url: "/hello",
    container: "#main",
    success: function() {
      equal(frame.location.pathname, "/hello")
      start()
    }
  })
})

asyncTest("replaces container html from response data", function() {
  var frame = this.frame

  frame.$.pjax({
    url: "/hello",
    container: "#main",
    success: function() {
      equal(frame.$("#main").html(), "<p>Hello!</p>")
      start()
    }
  })
})

asyncTest("sets title to response <title>", function() {
  var frame = this.frame

  frame.$.pjax({
    url: "/hello",
    container: "#main",
    success: function() {
      equal(frame.document.title, "Hello")
      equal(frame.location.pathname, "/hello")
      start()
    }
  })
})


asyncTest("triggers pjax:start event from container", function() {
  var frame = this.frame

  var startCalled

  frame.$("#main").on("pjax:start", function() {
    startCalled = this
  })

  frame.$.pjax({
    url: "/hello",
    container: "#main",
    success: function() {
      equal(startCalled, frame.$("#main")[0])
      start()
    }
  })
})

asyncTest("triggers pjax:end event from container", function() {
  var frame = this.frame

  var endCalled

  frame.$("#main").on("pjax:end", function() {
    equal(this, frame.$("#main")[0])
    start()
  })

  frame.$.pjax({
    url: "/hello",
    container: "#main"
  })
})


asyncTest("container option accepts String selector", function() {
  var frame = this.frame

  frame.$.pjax({
    url: "/hello",
    container: "#main",
    success: function() {
      equal(frame.$("#main").html(), "<p>Hello!</p>")
      start()
    }
  })
})

asyncTest("container option accepts jQuery object", function() {
  var frame = this.frame

  frame.$.pjax({
    url: "/hello",
    container: frame.$("#main"),
    success: function() {
      equal(frame.$("#main").html(), "<p>Hello!</p>")
      start()
    }
  })
})

asyncTest("container option accepts Element with ID", function() {
  var frame = this.frame

  frame.$.pjax({
    url: "/hello",
    container: frame.document.getElementById("main"),
    success: function() {
      equal(frame.$("#main").html(), "<p>Hello!</p>")
      start()
    }
  })
})

asyncTest("url option accepts function", function() {
  var frame = this.frame

  frame.$.pjax({
    url: function() { return "/hello" },
    container: "#main",
    success: function() {
      equal(frame.$("#main").html(), "<p>Hello!</p>")
      start()
    }
  })
})

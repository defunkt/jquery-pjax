if ($.support.pjax) {
  module("$.pjax", {
    setup: function() {
      var self = this
      stop()
      window.iframeLoad = function(frame) {
        self.frame = frame
        start()
      }
      $("#qunit-fixture").append("<iframe src='iframe.html'>")
    },
    teardown: function() {
      delete window.iframeLoad
    }
  })


  asyncTest("pushes new url", function() {
    var frame = this.frame

    frame.$.pjax({
      url: "hello.html",
      container: "#main",
      success: function() {
        equal(frame.location.pathname, "/hello.html")
        start()
      }
    })
  })

  asyncTest("replaces container html from response data", function() {
    var frame = this.frame

    frame.$.pjax({
      url: "hello.html",
      container: "#main",
      success: function() {
        equal(frame.$("#main").html().trim(), "<p>Hello!</p>")
        start()
      }
    })
  })

  asyncTest("sets title to response <title>", function() {
    var frame = this.frame

    frame.$.pjax({
      url: "hello.html",
      container: "#main",
      success: function() {
        equal(frame.document.title, "Hello")
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
      url: "hello.html",
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
      url: "hello.html",
      container: "#main"
    })
  })


  asyncTest("container option accepts String selector", function() {
    var frame = this.frame

    frame.$.pjax({
      url: "hello.html",
      container: "#main",
      success: function() {
        equal(frame.$("#main").html().trim(), "<p>Hello!</p>")
        start()
      }
    })
  })

  asyncTest("container option accepts jQuery object", function() {
    var frame = this.frame

    frame.$.pjax({
      url: "hello.html",
      container: frame.$("#main"),
      success: function() {
        equal(frame.$("#main").html().trim(), "<p>Hello!</p>")
        start()
      }
    })
  })

  asyncTest("container option accepts Element with ID", function() {
    var frame = this.frame

    frame.$.pjax({
      url: "hello.html",
      container: frame.document.getElementById("main"),
      success: function() {
        equal(frame.$("#main").html().trim(), "<p>Hello!</p>")
        start()
      }
    })
  })

  asyncTest("url option accepts function", function() {
    var frame = this.frame

    frame.$.pjax({
      url: function() { return "hello.html" },
      container: "#main",
      success: function() {
        equal(frame.$("#main").html().trim(), "<p>Hello!</p>")
        start()
      }
    })
  })
}

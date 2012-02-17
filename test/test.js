module("$.pjax", {
  setup: function() {
    window.callback = $.noop
  },
  teardown: function() {
    window.callback = null
    history.pushState({}, document.title, "/")
  }
})

asyncTest("pushes new url", function() {
  $.pjax({
    url: "/hello",
    container: "#main",
    success: function() {
      equal(window.location.pathname, "/hello")
      start()
    }
  })
})

asyncTest("replaces container html from response data", function() {
  $.pjax({
    url: "/hello",
    container: "#main",
    success: function() {
      equal($("#main").html(), "<p>Hello!</p>")
      start()
    }
  })
})

asyncTest("sets title to response <title>", function() {
  $.pjax({
    url: "/hello",
    container: "#main",
    success: function() {
      equal(document.title, "Hello")
      equal(window.location.pathname, "/hello")
      start()
    }
  })
})


asyncTest("triggers pjax:start event from container", function() {
  var startCalled

  $("#main").on("pjax:start", function() {
    startCalled = this
  })

  $.pjax({
    url: "/hello",
    container: "#main",
    success: function() {
      equal(startCalled, $("#main")[0])
      start()
    }
  })
})

asyncTest("triggers pjax:end event from container", function() {
  var endCalled

  $("#main").on("pjax:end", function() {
    equal(this, $("#main")[0])
    start()
  })

  $.pjax({
    url: "/hello",
    container: "#main"
  })
})


asyncTest("container option accepts String selector", function() {
  $.pjax({
    url: "/hello",
    container: "#main",
    success: function() {
      equal($("#main").html(), "<p>Hello!</p>")
      start()
    }
  })
})

asyncTest("container option accepts jQuery object", function() {
  $.pjax({
    url: "/hello",
    container: $("#main"),
    success: function() {
      equal($("#main").html(), "<p>Hello!</p>")
      start()
    }
  })
})

asyncTest("container option accepts Element with ID", function() {
  $.pjax({
    url: "/hello",
    container: document.getElementById("main"),
    success: function() {
      equal($("#main").html(), "<p>Hello!</p>")
      start()
    }
  })
})

asyncTest("url option accepts function", function() {
  $.pjax({
    url: function() { return "/hello" },
    container: "#main",
    success: function() {
      equal($("#main").html(), "<p>Hello!</p>")
      start()
    }
  })
})

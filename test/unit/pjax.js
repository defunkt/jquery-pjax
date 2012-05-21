if ($.support.pjax) {
  module("$.pjax", {
    setup: function() {
      var self = this
      stop()
      window.iframeLoad = function(frame) {
        self.frame = frame
        window.iframeLoad = $.noop
        start()
      }
      $("#qunit-fixture").append("<iframe src='home.html'>")
      this.iframe = $("iframe")[0]
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

  asyncTest("sets title to response title tag", function() {
    var frame = this.frame

    frame.$.pjax({
      url: "hello.html",
      container: "#main",
      success: function() {
        equal(frame.document.title, "Hello")
        ok(!frame.$("#main title").length)
        start()
      }
    })
  })

  asyncTest("sets title to response nested title tag", function() {
    var frame = this.frame

    frame.$.pjax({
      url: "nested_title.html",
      container: "#main",
      success: function() {
        equal(frame.document.title, "Hello")
        ok(!frame.$("#main title").length)
        start()
      }
    })
  })

  asyncTest("sets title to response last title tag", function() {
    var frame = this.frame

    frame.$.pjax({
      url: "double_title.html",
      container: "#main",
      success: function() {
        equal(frame.document.title, "World!")
        ok(!frame.$("#main title").length)
        start()
      }
    })
  })

  asyncTest("scrolls to top of page", function() {
    var frame = this.frame

    frame.window.scrollTo(0, 100)
    equal(frame.window.scrollY, 100)

    frame.$.pjax({
      url: "long.html",
      container: "#main",
      success: function() {
        equal(frame.window.scrollY, 0)
        start()
      }
    })
  })

  asyncTest("preserves current scroll position", function() {
    var frame = this.frame

    frame.window.scrollTo(0, 100)
    equal(frame.window.scrollY, 100)

    frame.$.pjax({
      url: "long.html",
      container: "#main",
      scrollTo: false,
      success: function() {
        equal(frame.window.scrollY, 100)
        start()
      }
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


  asyncTest("sets X-PJAX header on XHR request", function() {
    var frame = this.frame

    frame.$.pjax({
      url: "env.html",
      container: "#main",
      success: function() {
        var env = JSON.parse(frame.$("#env").text())
        ok(env['HTTP_X_PJAX'])
        start()
      }
    })
  })

  asyncTest("sets X-PJAX-Container header to container on XHR request", function() {
    var frame = this.frame

    frame.$.pjax({
      url: "env.html",
      container: "#main",
      success: function() {
        var env = JSON.parse(frame.$("#env").text())
        equal(env['HTTP_X_PJAX_CONTAINER'], "#main")
        start()
      }
    })
  })

  asyncTest("sets hidden _pjax param on XHR GET request", function() {
    var frame = this.frame

    frame.$.pjax({
      url: "env.html",
      container: "#main",
      success: function() {
        var env = JSON.parse(frame.$("#env").text())
        equal(env['rack.request.query_hash']['_pjax'], '#main')
        start()
      }
    })
  })

  asyncTest("preserves query string on GET request", function() {
    var frame = this.frame

    frame.$.pjax({
      url: "env.html?foo=1&bar=2",
      container: "#main",
      complete: function() {
        equal(frame.location.pathname, "/env.html")
        equal(frame.location.search, "?foo=1&bar=2")

        var env = JSON.parse(frame.$("#env").text())
        equal(env['rack.request.query_hash']['foo'], '1')
        equal(env['rack.request.query_hash']['bar'], '2')
        start()
      }
    })
  })


  asyncTest("only fragment is inserted", function() {
    var frame = this.frame

    frame.$.pjax({
      url: "hello.html?layout=true",
      fragment: "#main",
      container: "#main",
      success: function(data) {
        equal(typeof data, 'string')
        equal(frame.$("#main").html().trim(), "<p>Hello!</p>")
        start()
      }
    })
  })

  asyncTest("fragment sets title to response title tag", function() {
    var frame = this.frame

    frame.$.pjax({
      url: "hello.html?layout=true",
      fragment: "#main",
      container: "#main",
      success: function(data) {
        equal(frame.document.title, "Hello")
        start()
      }
    })
  })

  asyncTest("fragment sets title to response title attr", function() {
    var frame = this.frame

    frame.$.pjax({
      url: "fragment.html",
      fragment: "#foo",
      container: "#main",
      success: function(data) {
        equal(frame.document.title, "Foo")
        equal(frame.$("#main p").html(), "Foo")
        start()
      }
    })
  })

  asyncTest("fragment sets title to response data-title attr", function() {
    var frame = this.frame

    frame.$.pjax({
      url: "fragment.html",
      fragment: "#bar",
      container: "#main",
      success: function(data) {
        equal(frame.document.title, "Bar")
        equal(frame.$("#main p").html(), "Bar")
        start()
      }
    })
  })

  asyncTest("missing fragment falls back to full load", function() {
    var frame = this.frame

    frame.$.pjax({
      url: "hello.html?layout=true",
      fragment: "#missing",
      container: "#main"
    })

    this.iframe.onload = function() {
      equal(frame.$("#main p").html(), "Hello!")
      equal(frame.location.pathname, "/hello.html")
      start()
    }
  })

  asyncTest("missing data falls back to full load", function() {
    var frame = this.frame

    frame.$.pjax({
      url: "empty.html",
      container: "#main"
    })

    this.iframe.onload = function() {
      equal(frame.$("#main").html().trim(), "")
      equal(frame.location.pathname, "/empty.html")
      start()
    }
  })

  asyncTest("full html page falls back to full load", function() {
    var frame = this.frame

    frame.$.pjax({
      url: "hello.html?layout=true",
      container: "#main"
    })

    this.iframe.onload = function() {
      equal(frame.$("#main p").html(), "Hello!")
      equal(frame.location.pathname, "/hello.html")
      start()
    }
  })


  asyncTest("triggers pjax:start event from container", function() {
    var frame = this.frame

    var startCalled

    frame.$("#main").on("pjax:start", function(event, xhr, options) {
      startCalled = this

      ok(event)
      ok(xhr)
      equal(options.url, "hello.html")
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

    frame.$("#main").on("pjax:end", function(event, xhr, options) {
      ok(event)
      equal(xhr.status, 200)
      equal(options.url, "hello.html")

      equal(this, frame.$("#main")[0])

      start()
    })

    frame.$.pjax({
      url: "hello.html",
      container: "#main"
    })
  })

  asyncTest("sets relatedTarget to target", function() {
    var frame = this.frame

    var endCalled

    frame.$("#main").on("pjax:end", function(event, xhr, options) {
      ok(event)

      equal(event.relatedTarget, frame.$("#main")[0])
      equal(this, frame.$("#main")[0])

      start()
    })

    frame.$.pjax({
      url: "hello.html",
      container: "#main",
      target: frame.$("#main")[0]
    })
  })

  asyncTest("triggers pjax:beforeSend event from container", function() {
    var frame = this.frame

    frame.$("#main").on("pjax:beforeSend", function(event, xhr, settings, options) {
      ok(event)
      ok(xhr)
      equal(settings.url, "hello.html?_pjax=%23main")
    })

    frame.$.pjax({
      url: "hello.html",
      container: "#main",
      beforeSend: function(xhr, settings) {
        ok(xhr)
        equal(settings.url, "hello.html?_pjax=%23main")
      },
      success: function(data, status, xhr) {
        start()
      }
    })
  })

  asyncTest("stopping pjax:beforeSend prevents the request", function() {
    var frame = this.frame

    frame.$("#main").on("pjax:beforeSend", function(event, xhr) {
      ok(true)
      setTimeout(start, 0)
      return false
    })

    this.iframe.onload = function() { ok(false) }

    frame.$.pjax({
      url: "hello.html",
      container: "#main",
      success: function() {
        ok(false)
      }
    })
  })


  asyncTest("triggers pjax:success event from container", function() {
    var frame = this.frame

    stop()
    frame.$("#main").on("pjax:success", function(event, data, status, xhr, options) {
      ok(event)
      ok(data)
      equal(status, 'success')
      equal(xhr.status, 200)
      equal(options.url, "hello.html")
      start()
    })

    frame.$.pjax({
      url: "hello.html",
      container: "#main",
      success: function(data, status, xhr) {
        ok(data)
        equal(status, 'success')
        equal(xhr.status, 200)
        start()
      }
    })
  })

  asyncTest("triggers pjax:complete event from container", function() {
    var frame = this.frame

    stop()
    frame.$("#main").on("pjax:complete", function(event, xhr, status, options) {
      ok(event)
      equal(xhr.status, 200)
      equal(status, 'success')
      equal(options.url, "hello.html")
      start()
    })

    frame.$.pjax({
      url: "hello.html",
      container: "#main",
      complete: function(xhr, status) {
        equal(xhr.status, 200)
        equal(status, 'success')
        start()
      }
    })
  })

  asyncTest("triggers pjax:error event from container", function() {
    var frame = this.frame

    stop()
    frame.$("#main").on("pjax:error", function(event, xhr, status, error, options) {
      ok(event)
      equal(xhr.status, 500)
      equal(status, 'error')
      equal(error.trim(), 'Internal Server Error')
      equal(options.url, "boom.html")
      start()
    })

    frame.$.pjax({
      url: "boom.html",
      container: "#main",
      error: function(xhr, status, error) {
        equal(xhr.status, 500)
        equal(status, 'error')
        equal(error.trim(), 'Internal Server Error')
        start()
      }
    })
  })

  asyncTest("stopping pjax:error disables default behavior", function() {
    var frame = this.frame

    frame.$("#main").on("pjax:error", function(event, xhr) {
      ok(true)

      setTimeout(function() {
        xhr.abort()
        start()
      }, 0)

      return false
    })

    this.iframe.onload = function() { ok(false) }

    frame.$.pjax({
      url: "boom.html",
      container: "#main"
    })
  })

  asyncTest("loads fallback if timeout event isn't handled", function() {
    var frame = this.frame

    frame.$.pjax({
      url: "timeout.html",
      container: "#main"
    })

    this.iframe.onload = function() {
      equal(frame.$("#main p").html(), "SLOW DOWN!")
      equal(frame.location.pathname, "/timeout.html")
      start()
    }
  })

  asyncTest("stopping pjax:timeout disables default behavior", function() {
    var frame = this.frame

    frame.$("#main").on("pjax:timeout", function(event, xhr) {
      ok(true)

      setTimeout(function() {
        xhr.abort()
        start()
      }, 0)

      return false
    })

    this.iframe.onload = function() { ok(false) }

    frame.$.pjax({
      url: "timeout.html",
      container: "#main"
    })
  })

  asyncTest("500 loads fallback", function() {
    var frame = this.frame

    frame.$.pjax({
      url: "boom.html",
      container: "#main"
    })

    this.iframe.onload = function() {
      equal(frame.$("#main p").html(), "500")
      equal(frame.location.pathname, "/boom.html")
      start()
    }
  })


  function goBack(frame, callback) {
    setTimeout(function() {
      frame.$("#main").one("pjax:end", callback)
      frame.history.back()
    }, 0)
  }

  function goForward(frame, callback) {
    setTimeout(function() {
      frame.$("#main").one("pjax:end", callback)
      frame.history.forward()
    }, 0)
  }

  asyncTest("popstate going back to page", function() {
    var frame = this.frame

    equal(frame.location.pathname, "/home.html")
    equal(frame.document.title, "Home")

    frame.$.pjax({
      url: "hello.html",
      container: "#main",
      complete: function() {
        equal(frame.location.pathname, "/hello.html")
        equal(frame.document.title, "Hello")

        ok(frame.history.length > 1)
        goBack(frame, function() {
          equal(frame.location.pathname, "/home.html")
          equal(frame.document.title, "Home")
          start()
        })
      }
    })
  })

  asyncTest("popstate going forward to page", function() {
    var frame = this.frame

    equal(frame.location.pathname, "/home.html")
    equal(frame.document.title, "Home")

    frame.$.pjax({
      url: "hello.html",
      container: "#main",
      complete: function() {
        equal(frame.location.pathname, "/hello.html")
        equal(frame.document.title, "Hello")

        ok(frame.history.length > 1)
        goBack(frame, function() {
          goForward(frame, function() {
            equal(frame.location.pathname, "/hello.html")
            equal(frame.document.title, "Hello")
            start()
          })
        })
      }
    })
  })

  asyncTest("popstate preserves scroll position", function() {
    var frame = this.frame

    equal(frame.location.pathname, "/home.html")

    frame.window.scrollTo(0, 100)
    equal(frame.window.scrollY, 100)

    frame.$.pjax({
      url: "long.html",
      container: "#main",
      complete: function() {
        equal(frame.location.pathname, "/long.html")
        equal(frame.window.scrollY, 0)

        ok(frame.history.length > 1)
        goBack(frame, function() {
          equal(frame.location.pathname, "/home.html")

          // PENDING: Popstate scroll position restore doesn't seem to
          // work inside an iframe.
          // equal(frame.window.scrollY, 100)

          start()
        })
      }
    })
  })

  asyncTest("popstate going back to page triggers pjax:popstate event", function() {
    var frame = this.frame

    equal(frame.location.pathname, "/home.html")

    frame.$('#main').on('pjax:popstate', function(event) {
      equal(frame.location.pathname, "/home.html")
      equal(event.state.container, '#main')
      equal(event.direction, 'back')
      start()
    })

    frame.$.pjax({
      url: "hello.html",
      container: "#main",
      complete: function() {
        equal(frame.location.pathname, "/hello.html")

        ok(frame.history.length > 1)
        goBack(frame, function() {})
      }
    })
  })

  asyncTest("popstate preserves GET data", function() {
    var frame = this.frame

    frame.$.pjax({
      url: "env.html?foo=1",
      data: { bar: 2 },
      container: "#main",
      complete: function() {
        equal(frame.location.pathname, "/env.html")
        equal(frame.location.search, "?foo=1&bar=2")

        var env = JSON.parse(frame.$("#env").text())
        equal(env['rack.request.query_hash']['foo'], '1')
        equal(env['rack.request.query_hash']['bar'], '2')

        frame.$.pjax({
          url: "hello.html",
          container: "#main",
          complete: function() {
            equal(frame.location.pathname, "/hello.html")

            ok(frame.history.length > 2)
            goBack(frame, function() {
              equal(frame.location.pathname, "/env.html")
              equal(frame.location.search, "?foo=1&bar=2")

              var env = JSON.parse(frame.$("#env").text())
              equal(env['rack.request.query_hash']['foo'], '1')
              equal(env['rack.request.query_hash']['bar'], '2')

              start()
            })
          }
        })
      }
    })
  })

  asyncTest("follows redirect with X-PJAX-URL header", function() {
    var frame = this.frame

    frame.$.pjax({
      url: "redirect.html",
      container: "#main",
      success: function() {
        equal(frame.location.pathname, "/hello.html")
        equal(frame.$("#main").html().trim(), "<p>Hello!</p>")
        start()
      }
    })
  })

  asyncTest("lazily sets initial $.pjax.state", function() {
    var frame = this.frame

    ok(!frame.$.pjax.state)

    frame.$.pjax({
      url: "hello.html",
      container: "#main",
      success: start
    })

    ok(frame.$.pjax.state.id)
    equal(frame.$.pjax.state.url, frame.location.origin + "/home.html")
    equal(frame.$.pjax.state.container, "#main")
  })

  asyncTest("updates $.pjax.state to new page", function() {
    var frame = this.frame

    frame.$.pjax({
      url: "hello.html",
      container: "#main",
      success: function() {
        ok(frame.$.pjax.state.id)
        equal(frame.$.pjax.state.url, frame.location.origin + "/hello.html")
        equal(frame.$.pjax.state.container, "#main")
        start()
      }
    })
  })

  asyncTest("new id is generated for new pages", function() {
    var frame = this.frame

    var oldId

    frame.$.pjax({
      url: "hello.html",
      container: "#main",
      success: function() {
        ok(frame.$.pjax.state.id)
        notEqual(oldId, frame.$.pjax.state.id)
        start()
      }
    })

    ok(frame.$.pjax.state.id)
    oldId = frame.$.pjax.state.id
  })

  asyncTest("id is the same going back", function() {
    var frame = this.frame

    var oldId

    equal(frame.location.pathname, "/home.html")

    frame.$.pjax({
      url: "hello.html",
      container: "#main",
      complete: function() {
        ok(frame.$.pjax.state.id)
        notEqual(oldId, frame.$.pjax.state.id)

        ok(frame.history.length > 1)
        goBack(frame, function() {
          ok(frame.$.pjax.state.id)
          equal(oldId, frame.$.pjax.state.id)
          start()
        })
      }
    })

    ok(frame.$.pjax.state.id)
    oldId = frame.$.pjax.state.id
  })
}

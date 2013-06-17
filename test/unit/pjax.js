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

    frame.$('#main').on('pjax:success', function() {
      equal(frame.location.pathname, "/hello.html")
      start()
    })
    frame.$.pjax({
      url: "hello.html",
      container: "#main"
    })
  })

  asyncTest("replaces container html from response data", function() {
    var frame = this.frame

    frame.$('#main').on('pjax:success', function() {
      equal(frame.$("#main > p").html().trim(), "Hello!")
      equal(frame.$("#main").contents().eq(1).text().trim(), "How's it going?")
      start()
    })
    frame.$.pjax({
      url: "hello.html",
      container: "#main"
    })
  })

  asyncTest("sets title to response title tag", function() {
    var frame = this.frame

    frame.$('#main').on('pjax:success', function() {
      equal(frame.document.title, "Hello")
      ok(!frame.$("#main title").length)
      start()
    })
    frame.$.pjax({
      url: "hello.html",
      container: "#main"
    })
  })

  asyncTest("sets title to response nested title tag", function() {
    var frame = this.frame

    frame.$('#main').on('pjax:success', function() {
      equal(frame.document.title, "Hello")
      ok(!frame.$("#main title").length)
      start()
    })
    frame.$.pjax({
      url: "nested_title.html",
      container: "#main"
    })
  })

  asyncTest("sets title to response last title tag", function() {
    var frame = this.frame

    frame.$('#main').on('pjax:success', function() {
      equal(frame.document.title, "World!")
      ok(!frame.$("#main title").length)
      start()
    })
    frame.$.pjax({
      url: "double_title.html",
      container: "#main"
    })
  })

  asyncTest("scrolls to top of page", function() {
    var frame = this.frame

    frame.window.scrollTo(0, 100)
    equal(frame.window.scrollY, 100)

    frame.$('#main').on('pjax:success', function() {
      equal(frame.window.scrollY, 0)
      start()
    })
    frame.$.pjax({
      url: "long.html",
      container: "#main"
    })
  })

  asyncTest("preserves current scroll position", function() {
    var frame = this.frame

    frame.window.scrollTo(0, 100)
    equal(frame.window.scrollY, 100)

    frame.$('#main').on('pjax:success', function() {
      equal(frame.window.scrollY, 100)
      start()
    })
    frame.$.pjax({
      url: "long.html",
      container: "#main",
      scrollTo: false
    })
  })

  asyncTest("evals scripts", function() {
    var frame = this.frame

    frame.evaledScriptLoaded = function() {
      equal(true, frame.evaledSrcScript)
      equal(true, frame.evaledInlineScript)
      start()
    }
    frame.$.pjax({
      url: "scripts.html",
      container: "#main"
    })
  })


  asyncTest("container option accepts String selector", function() {
    var frame = this.frame

    frame.$('#main').on('pjax:success', function() {
      equal(frame.$("#main > p").html().trim(), "Hello!")
      start()
    })
    frame.$.pjax({
      url: "hello.html",
      container: "#main"
    })
  })

  asyncTest("container option accepts jQuery object", function() {
    var frame = this.frame

    frame.$('#main').on('pjax:success', function() {
      equal(frame.$("#main > p").html().trim(), "Hello!")
      start()
    })
    frame.$.pjax({
      url: "hello.html",
      container: frame.$("#main")
    })
  })

  asyncTest("container option accepts Element with ID", function() {
    var frame = this.frame

    frame.$('#main').on('pjax:success', function() {
      equal(frame.$("#main > p").html().trim(), "Hello!")
      start()
    })
    frame.$.pjax({
      url: "hello.html",
      container: frame.document.getElementById("main")
    })
  })

  asyncTest("url option accepts function", function() {
    var frame = this.frame

    frame.$('#main').on('pjax:success', function() {
      equal(frame.$("#main > p").html().trim(), "Hello!")
      start()
    })
    frame.$.pjax({
      url: function() { return "hello.html" },
      container: "#main"
    })
  })


  asyncTest("sets X-PJAX header on XHR request", function() {
    var frame = this.frame

    frame.$('#main').on('pjax:success', function() {
      var env = JSON.parse(frame.$("#env").text())
      ok(env['HTTP_X_PJAX'])
      start()
    })
    frame.$.pjax({
      url: "env.html",
      container: "#main"
    })
  })

  asyncTest("sets X-PJAX-Container header to container on XHR request", function() {
    var frame = this.frame

    frame.$('#main').on('pjax:success', function() {
      var env = JSON.parse(frame.$("#env").text())
      equal(env['HTTP_X_PJAX_CONTAINER'], "#main")
      start()
    })
    frame.$.pjax({
      url: "env.html",
      container: "#main"
    })
  })

  asyncTest("sets hidden _pjax param on XHR GET request", function() {
    var frame = this.frame

    frame.$('#main').on('pjax:success', function() {
      var env = JSON.parse(frame.$("#env").text())
      equal(env['rack.request.query_hash']['_pjax'], '#main')
      start()
    })
    frame.$.pjax({
      url: "env.html",
      container: "#main"
    })
  })

  asyncTest("preserves query string on GET request", function() {
    var frame = this.frame

    frame.$('#main').on('pjax:success', function() {
      equal(frame.location.pathname, "/env.html")
      equal(frame.location.search, "?foo=1&bar=2")

      var env = JSON.parse(frame.$("#env").text())
      equal(env['rack.request.query_hash']['foo'], '1')
      equal(env['rack.request.query_hash']['bar'], '2')
      start()
    })
    frame.$.pjax({
      url: "env.html?foo=1&bar=2",
      container: "#main"
    })
  })

  asyncTest("GET data is appended to query string", function() {
    var frame = this.frame

    frame.$('#main').on('pjax:success', function() {
      equal(frame.location.pathname, "/env.html")
      equal(frame.location.search, "?foo=1&bar=2")

      var env = JSON.parse(frame.$("#env").text())
      equal(env['rack.request.query_hash']['foo'], '1')
      equal(env['rack.request.query_hash']['bar'], '2')
      start()
    })
    frame.$.pjax({
      url: "env.html",
      data: { foo: 1, bar: 2 },
      container: "#main"
    })

    // URL is set immediately
    equal(frame.location.pathname, "/env.html")
    equal(frame.location.search, "?foo=1&bar=2")
  })

  asyncTest("GET data is merged into query string", function() {
    var frame = this.frame

    frame.$('#main').on('pjax:success', function() {
      equal(frame.location.pathname, "/env.html")
      equal(frame.location.search, "?foo=1&bar=2")

      var env = JSON.parse(frame.$("#env").text())
      equal(env['rack.request.query_hash']['foo'], '1')
      equal(env['rack.request.query_hash']['bar'], '2')
      start()
    })
    frame.$.pjax({
      url: "env.html?foo=1",
      data: { bar: 2 },
      container: "#main"
    })

    // URL is set immediately
    equal(frame.location.pathname, "/env.html")
    equal(frame.location.search, "?foo=1&bar=2")
  })


  asyncTest("only fragment is inserted", function() {
    var frame = this.frame

    frame.$('#main').on('pjax:success', function(event, data) {
      equal(typeof data, 'string')
      equal(frame.$("#main > p").html().trim(), "Hello!")
      start()
    })
    frame.$.pjax({
      url: "hello.html?layout=true",
      fragment: "#main",
      container: "#main"
    })
  })

  asyncTest("use body as fragment", function() {
    var frame = this.frame

    frame.$('body').on('pjax:success', function(event, data) {
      equal(typeof data, 'string')
      equal(frame.$("body > p").html().trim(), "Hello!")
      equal(frame.document.title, "Hello")
      start()
    })
    frame.$.pjax({
      url: "hello.html?layout=true",
      fragment: "body",
      container: "body"
    })
  })

  asyncTest("fragment sets title to response title tag", function() {
    var frame = this.frame

    frame.$('#main').on('pjax:success', function() {
      equal(frame.document.title, "Hello")
      start()
    })
    frame.$.pjax({
      url: "hello.html?layout=true",
      fragment: "#main",
      container: "#main"
    })
  })

  asyncTest("fragment sets title to response title attr", function() {
    var frame = this.frame

    frame.$('#main').on('pjax:success', function() {
      equal(frame.document.title, "Foo")
      equal(frame.$("#main p").html(), "Foo")
      start()
    })
    frame.$.pjax({
      url: "fragment.html",
      fragment: "#foo",
      container: "#main"
    })
  })

  asyncTest("fragment sets title to response data-title attr", function() {
    var frame = this.frame

    frame.$('#main').on('pjax:success', function() {
      equal(frame.document.title, "Bar")
      equal(frame.$("#main p").html(), "Bar")
      start()
    })
    frame.$.pjax({
      url: "fragment.html",
      fragment: "#bar",
      container: "#main"
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

  asyncTest("header version mismatch does a full load", function() {
    var frame = this.frame

    frame.$.pjax.defaults.version = 'v2'

    frame.$.pjax({
      url: "hello.html",
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
    frame.$('#main').on('pjax:success', function() {
      equal(startCalled, frame.$("#main")[0])
      start()
    })

    frame.$.pjax({
      url: "hello.html",
      container: "#main"
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
    frame.$("#main").on("pjax:success", function() {
      start()
    })

    frame.$.pjax({
      url: "hello.html",
      container: "#main"
    })
  })

  asyncTest("stopping pjax:beforeSend prevents the request", function() {
    var frame = this.frame

    frame.$("#main").on("pjax:beforeSend", function(event, xhr) {
      ok(true)
      setTimeout(start, 0)
      return false
    })
    frame.$("#main").on("pjax:success", function() {
      ok(false)
    })

    this.iframe.onload = function() { ok(false) }

    frame.$.pjax({
      url: "hello.html",
      container: "#main"
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
    frame.$("#main").on("pjax:success", function(event, data, status, xhr) {
      ok(data)
      equal(status, 'success')
      equal(xhr.status, 200)
      start()
    })

    frame.$.pjax({
      url: "hello.html",
      container: "#main"
    })
  })

  asyncTest("triggers pjax:complete event from container", function() {
    var frame = this.frame

    frame.$("#main").on("pjax:complete", function(event, xhr, status, options) {
      ok(event)
      equal(xhr.status, 200)
      equal(status, 'success')
      equal(options.url, "hello.html")
      start()
    })

    frame.$.pjax({
      url: "hello.html",
      container: "#main"
    })
  })

  asyncTest("triggers pjax:error event from container", function() {
    var frame = this.frame

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
      container: "#main"
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

  asyncTest("POST never times out", function() {
    var frame = this.frame

    frame.$("#main").on("pjax:complete", function() {
      equal(frame.$("#main p").html(), "SLOW DOWN!")
      equal(frame.location.pathname, "/timeout.html")
      start()
    })
    frame.$("#main").on("pjax:timeout", function(event, xhr) {
      ok(false)
    })
    this.iframe.onload = function() { ok(false) }

    frame.$.pjax({
      type: 'POST',
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

  asyncTest("POST 500 never loads fallback", function() {
    var frame = this.frame

    frame.$("#main").on("pjax:complete", function() {
      equal(frame.location.pathname, "/boom.html")
      start()
    })
    frame.$("#main").on("pjax:error", function(event, xhr) {
      ok(true)
    })
    frame.$("#main").on("pjax:timeout", function(event, xhr) {
      ok(false)
    })
    this.iframe.onload = function() { ok(false) }

    frame.$.pjax({
      type: 'POST',
      url: "boom.html",
      container: "#main"
    })
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

    frame.$("#main").on("pjax:complete", function() {
      equal(frame.location.pathname, "/hello.html")
      equal(frame.document.title, "Hello")

      ok(frame.history.length > 1)
      goBack(frame, function() {
        equal(frame.location.pathname, "/home.html")
        equal(frame.document.title, "Home")
        start()
      })
    })
    frame.$.pjax({
      url: "hello.html",
      container: "#main"
    })
  })

  asyncTest("popstate going forward to page", function() {
    var frame = this.frame

    equal(frame.location.pathname, "/home.html")
    equal(frame.document.title, "Home")

    frame.$("#main").on("pjax:complete", function() {
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
    })
    frame.$.pjax({
      url: "hello.html",
      container: "#main"
    })
  })

  asyncTest("popstate preserves scroll position", function() {
    var frame = this.frame

    equal(frame.location.pathname, "/home.html")

    frame.window.scrollTo(0, 100)
    equal(frame.window.scrollY, 100)

    frame.$("#main").on("pjax:complete", function() {
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
    })
    frame.$.pjax({
      url: "long.html",
      container: "#main"
    })
  })

  asyncTest("popstate going back to page triggers pjax:popstate event", function() {
    var frame = this.frame

    equal(frame.location.pathname, "/home.html")

    frame.$('#main').on("pjax:complete", function() {
      equal(frame.location.pathname, "/hello.html")

      ok(frame.history.length > 1)
      goBack(frame, function() {})
    })
    frame.$('#main').on('pjax:popstate', function(event) {
      equal(frame.location.pathname, "/home.html")
      equal(event.state.container, '#main')
      equal(event.direction, 'back')
      start()
    })

    frame.$.pjax({
      url: "hello.html",
      container: "#main"
    })
  })

  // Test is fragile
  asyncTest("no initial pjax:popstate event", function() {
    var frame = this.frame
    var count = 0;

    window.iframeLoad = function() {
      count++

      if (count == 1) {
        equal(frame.location.pathname, "/home.html")
        frame.location.pathname = "/hello.html"
      } else if (count == 2) {
        equal(frame.location.pathname, "/hello.html")
        frame.$.pjax({url: "env.html", container: "#main"})
      } else if (count == 3) {
        equal(frame.location.pathname, "/env.html")
        frame.history.back()
        setTimeout(function() { window.iframeLoad(frame) }, 1000)
      } else if (count == 4) {
        equal(frame.location.pathname, "/hello.html")
        frame.history.back()
        setTimeout(function() { window.iframeLoad(frame) }, 1000)
      } else if (count == 5) {
        equal(frame.location.pathname, "/home.html")
        frame.history.forward()
        setTimeout(function() { window.iframeLoad(frame) }, 1000)
      } else if (count == 6) {
        // Should skip pjax:popstate since there's no initial pjax.state
        frame.$('#main').on('pjax:popstate', function(event) {
          if (count == 6) {
            ok(event.state.url.match("/hello.html"), event.state.url)
            ok(false)
          } else if (count == 7) {
            ok(event.state.url.match("/env.html"), event.state.url)
            ok(true)
          }
        })

        frame.$(frame.window).on('popstate', function() {
          if (count == 6) {
            count++
            frame.history.forward()
            setTimeout(function() { window.iframeLoad(frame) }, 1000)
          } else {
            setTimeout(function() { start() }, 1000)
          }
        })
      }
    }

    window.iframeLoad()
  })

  asyncTest("popstate preserves GET data", function() {
    var frame = this.frame

    frame.$('#main').one("pjax:complete", function() {
      equal(frame.location.pathname, "/env.html")
      equal(frame.location.search, "?foo=1&bar=2")

      var env = JSON.parse(frame.$("#env").text())
      equal(env['rack.request.query_hash']['foo'], '1')
      equal(env['rack.request.query_hash']['bar'], '2')

      frame.$('#main').one("pjax:complete", function() {
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
      })
      frame.$.pjax({
        url: "hello.html",
        container: "#main"
      })
    })
    frame.$.pjax({
      url: "env.html?foo=1",
      data: { bar: 2 },
      container: "#main"
    })
  })

  asyncTest("follows redirect with X-PJAX-URL header", function() {
    var frame = this.frame

    frame.$('#main').on("pjax:success", function() {
      equal(frame.location.pathname, "/hello.html")
      equal(frame.$("#main > p").html().trim(), "Hello!")
      start()
    })
    frame.$.pjax({
      url: "redirect.html",
      container: "#main"
    })
  })

  asyncTest("lazily sets initial $.pjax.state", function() {
    var frame = this.frame

    ok(!frame.$.pjax.state)

    frame.$('#main').on("pjax:success", function() {
      start()
    })
    frame.$.pjax({
      url: "hello.html",
      container: "#main"
    })

    ok(frame.$.pjax.state.id)
    ok(frame.$.pjax.state.url.match("/home.html"))
    equal(frame.$.pjax.state.container, "#main")
  })

  asyncTest("updates $.pjax.state to new page", function() {
    var frame = this.frame

    frame.$('#main').on("pjax:success", function() {
      ok(frame.$.pjax.state.id)
      ok(frame.$.pjax.state.url.match("/hello.html"))
      equal(frame.$.pjax.state.container, "#main")
      start()
    })
    frame.$.pjax({
      url: "hello.html",
      container: "#main"
    })
  })

  asyncTest("new id is generated for new pages", function() {
    var frame = this.frame

    var oldId

    frame.$('#main').on("pjax:success", function() {
      ok(frame.$.pjax.state.id)
      notEqual(oldId, frame.$.pjax.state.id)
      start()
    })
    frame.$.pjax({
      url: "hello.html",
      container: "#main"
    })

    ok(frame.$.pjax.state.id)
    oldId = frame.$.pjax.state.id
  })

  asyncTest("id is the same going back", function() {
    var frame = this.frame

    var oldId

    equal(frame.location.pathname, "/home.html")

    frame.$('#main').on("pjax:complete", function() {
      ok(frame.$.pjax.state.id)
      notEqual(oldId, frame.$.pjax.state.id)

      ok(frame.history.length > 1)
      goBack(frame, function() {
        ok(frame.$.pjax.state.id)
        equal(oldId, frame.$.pjax.state.id)
        start()
      })
    })
    frame.$.pjax({
      url: "hello.html",
      container: "#main"
    })

    ok(frame.$.pjax.state.id)
    oldId = frame.$.pjax.state.id
  })
}

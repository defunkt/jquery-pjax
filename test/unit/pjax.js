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
      equal(frame.location.search, "")
      start()
    })
    frame.$.pjax({
      url: "hello.html",
      container: "#main",
      cache: false
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
    equal(frame.window.pageYOffset, 100)

    frame.$('#main').on('pjax:success', function() {
      equal(frame.window.pageYOffset, 0)
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
    equal(frame.window.pageYOffset, 100)

    frame.$('#main').on('pjax:success', function() {
      equal(frame.window.pageYOffset, 100)
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
      equal(frame.evaledSrcScriptNum, 2)
      deepEqual(frame.evaledInlineLog, ["one"])

      frame.$.pjax({
        url: "scripts.html?name=two",
        container: "#main"
      })

      frame.$("#main").one("pjax:end", function() {
        deepEqual(frame.evaledInlineLog, ["one", "two"])

        goBack(frame, function() {
          deepEqual(frame.evaledInlineLog, ["one", "two", "one"])

          goForward(frame, function() {
            deepEqual(frame.evaledInlineLog, ["one", "two", "one", "two"])
            equal(frame.evaledSrcScriptNum, 2)
            start()
          })
        })
      })
    }

    frame.$.pjax({
      url: "scripts.html?name=one",
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

  asyncTest("sets hidden _pjax param on XHR GET request", 1, function() {
    var frame = this.frame

    frame.$('#main').on('pjax:success', function() {
      var env = JSON.parse(frame.$("#env").text())
      equal(env['rack.request.query_hash']['_pjax'], '#main')
      start()
    })
    frame.$.pjax({
      url: "env.html",
      data: undefined,
      container: "#main"
    })
  })

  asyncTest("sets hidden _pjax param if array data is supplied", 1, function() {
    var frame = this.frame

    frame.$('#main').on('pjax:success', function() {
      var env = JSON.parse(frame.$("#env").text())
      deepEqual(env['rack.request.query_hash'], {
        _pjax: '#main',
        foo: 'bar'
      })
      start()
    })
    frame.$.pjax({
      url: "env.html",
      data: [{ name: "foo", value: "bar" }],
      container: "#main"
    })
  })

  asyncTest("sets hidden _pjax param if object data is supplied", 1, function() {
    var frame = this.frame

    frame.$('#main').on('pjax:success', function() {
      var env = JSON.parse(frame.$("#env").text())
      deepEqual(env['rack.request.query_hash'], {
        _pjax: '#main',
        foo: 'bar'
      })
      start()
    })
    frame.$.pjax({
      url: "env.html",
      data: { foo: "bar" },
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

  asyncTest("mixed containers", function() {
    var frame = this.frame

    frame.$.pjax({
      url: "fragment.html",
      container: "#main"
    })

    frame.$("#main").one("pjax:end", function() {
      frame.$.pjax({
        url: "aliens.html",
        container: "#foo"
      })

      frame.$("#foo").one("pjax:end", function() {
        equal(frame.$("#main > #foo > ul > li").last().text(), "aliens")

        goBack(frame, function() {
          equal(frame.$("#main > #foo").text().trim(), "Foo")

          goBack(frame, function() {
            equal(frame.$("#main > ul > li").first().text(), "home")

            goForward(frame, function() {
              goForward(frame, function() {
                equal(frame.$("#main > #foo > ul > li").last().text(), "aliens")
                start()
              })
            })
          })
        })
      })
    })
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
      equal(frame.$("body > #main > p").html().trim(), "Hello!")
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

  asyncTest("triggers pjax:beforeReplace event from container", function() {
    var frame = this.frame,
        beforeContent = 'foo'

    frame.$("#main")
         .text(beforeContent)
         .on("pjax:beforeReplace", function(event, contents, options) {
      ok(event)
      ok(contents)
      equal($(event.target).text(), beforeContent)
      equal(options.url, "hello.html")

      ok(event.state.url.match("/hello.html"))
      ok(event.previousState.url.match("/home.html"))
      ok(frame.$.pjax.state.url.match("/hello.html"))
    })
    frame.$("#main").on("pjax:success", function(event) {
      notEqual($(event.target).text(), beforeContent)
      start()
    })

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
      url: "timeout.html#hello",
      container: "#main"
    })

    equal(frame.location.pathname, "/timeout.html")
    equal(frame.location.hash, "#hello")

    this.iframe.onload = function() {
      equal(frame.$("#main p").html(), "SLOW DOWN!")
      equal(frame.location.pathname, "/timeout.html")
      equal(frame.location.hash, "#hello")
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

  asyncTest("clicking back while loading cancels XHR", function() {
    var frame = this.frame

    frame.$('#main').on('pjax:timeout', function(event) {
      event.preventDefault()
    })

    frame.$("#main").one('pjax:send', function() {

      // Check that our request is aborted (need to check
      // how robust this is across browsers)
      frame.$("#main").one('pjax:complete', function(e, xhr, textStatus) {
        equal(xhr.status, 0)
        equal(textStatus, 'abort')
      })

      setTimeout(function() {
        frame.history.back()
      }, 250)

      // Make sure the URL and content remain the same after the
      // XHR would have arrived (delay on timeout.html is 1s)
      setTimeout(function() {
        var afterBackLocation = frame.location.pathname
        var afterBackTitle = frame.document.title

        setTimeout(function() {
          equal(frame.location.pathname, afterBackLocation)
          equal(frame.document.title, afterBackTitle)
          start()
        }, 1000)
      }, 500)
    })

    frame.$.pjax({
      url: "timeout.html",
      container: "#main"
    })
  })

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
    equal(frame.window.pageYOffset, 100)

    frame.$("#main").on("pjax:complete", function() {
      equal(frame.location.pathname, "/long.html")
      equal(frame.window.pageYOffset, 0)

      ok(frame.history.length > 1)
      goBack(frame, function() {
        equal(frame.location.pathname, "/home.html")

        // PENDING: Popstate scroll position restore doesn't seem to
        // work inside an iframe.
        // equal(frame.window.pageYOffset, 100)

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

  asyncTest("popstate triggers pjax:beforeReplace event", function() {
    var frame = this.frame,
        originalContent = $(frame).html()

    equal(frame.location.pathname, "/home.html")

    frame.$('#main').on("pjax:complete", function() {
      equal(frame.location.pathname, "/hello.html")
      ok(frame.history.length > 1)

      frame.$('#main').on('pjax:beforeReplace', function(event, contents, options) {
        ok(event)
        ok(contents)
        equal(frame.location.pathname, "/home.html")
        ok(options.url.match("/home.html"))
        // Remember: the content hasn't yet been replaced.
        notEqual($(event.target).html(), originalContent)

        ok(event.state.url.match("/home.html"))
        ok(event.previousState.url.match("/hello.html"))
        ok(frame.$.pjax.state.url.match("/home.html"))

        start()
      })

      goBack(frame, function() {})
    })

    frame.$.pjax({
      url: "hello.html",
      container: "#main"
    })
  })

  asyncTest("no initial pjax:popstate event", function() {
    var frame = this.frame
    var count = 0

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
      } else if (count == 4) {
        equal(frame.location.pathname, "/hello.html")
        frame.history.back()
      } else if (count == 5) {
        equal(frame.location.pathname, "/home.html")
        frame.history.forward()
      } else if (count == 6) {
        frame.$('#main').on('pjax:popstate', function(event) {
          if (count == 6) {
            // Should skip pjax:popstate since there's no initial pjax.state
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
          }
        })

        // Browsers that don't fire initial "popstate" should just resume
        setTimeout(function() {
          start()
        }, 100)
      }
    }

    window.iframeLoad()
  })

  asyncTest("hitting the back button obeys maxCacheLength", function() {
    var frame = this.frame
    var count = 0
    var didHitServer

    // Reduce the maxCacheLength for this spec to make it easier to test.
    frame.$.pjax.defaults.maxCacheLength = 1

    // This event will fire only when we request a page from the server, so we
    // can use it to detect a cache miss.
    frame.$("#main").on("pjax:beforeSend", function() {
      didHitServer = true
    })

    frame.$("#main").on("pjax:end", function() {
      count++

      // First, navigate twice.
      if (count == 1) {
        frame.$.pjax({url: "env.html", container: "#main"})
      } else if (count == 2) {
        frame.$.pjax({url: "hello.html", container: "#main"})
      } else if (count == 3) {
        // There should now be one item in the back cache.
        didHitServer = false
        frame.history.back()
      } else if (count == 4) {
        equal(frame.location.pathname, "/env.html", "Went backward")
        equal(didHitServer, false, "Hit cache")
        frame.history.back()
      } else if (count == 5) {
        equal(frame.location.pathname, "/hello.html", "Went backward")
        equal(didHitServer, true, "Hit server")
        start()
      }
    })

    frame.$.pjax({url: "hello.html", container: "#main"})
  })

  asyncTest("hitting the forward button obeys maxCacheLength", function() {
    var frame = this.frame
    var count = 0
    var didHitServer

    // Reduce the maxCacheLength for this spec to make it easier to test.
    frame.$.pjax.defaults.maxCacheLength = 1

    // This event will fire only when we request a page from the server, so we
    // can use it to detect a cache miss.
    frame.$("#main").on("pjax:beforeSend", function() {
      didHitServer = true
    })

    frame.$("#main").on("pjax:end", function() {
      count++

      if (count == 1) {
        frame.$.pjax({url: "env.html", container: "#main"})
      } else if (count == 2) {
        frame.$.pjax({url: "hello.html", container: "#main"})
      } else if (count == 3) {
        frame.history.back()
      } else if (count == 4) {
        frame.history.back()
      } else if (count == 5) {
        // There should now be one item in the forward cache.
        didHitServer = false
        frame.history.forward()
      } else if (count == 6) {
        equal(frame.location.pathname, "/env.html", "Went forward")
        equal(didHitServer, false, "Hit cache")
        frame.history.forward()
      } else if (count == 7) {
        equal(frame.location.pathname, "/hello.html", "Went forward")
        equal(didHitServer, true, "Hit server")
        start()
      }
    })

    frame.$.pjax({url: "hello.html", container: "#main"})
  })

  asyncTest("setting maxCacheLength to 0 disables caching", function() {
    var frame = this.frame
    var count = 0
    var didHitServer

    // Set maxCacheLength to 0 to disable caching completely.
    frame.$.pjax.defaults.maxCacheLength = 0

    // This event will fire only when we request a page from the server, so we
    // can use it to detect a cache miss.
    frame.$("#main").on("pjax:beforeSend", function() {
      didHitServer = true
    })

    frame.$("#main").on("pjax:end", function() {
      count++

      if (count == 1) {
        didHitServer = false
        frame.$.pjax({url: "env.html", container: "#main"})
      } else if (count == 2) {
        equal(frame.location.pathname, "/env.html", "Navigated to a new page")
        equal(didHitServer, true, "Hit server")
        didHitServer = false
        frame.history.back()
      } else if (count == 3) {
        equal(frame.location.pathname, "/hello.html", "Went backward")
        equal(didHitServer, true, "Hit server")
        didHitServer = false
        frame.history.forward()
      } else if (count == 4) {
        equal(frame.location.pathname, "/env.html", "Went forward")
        equal(didHitServer, true, "Hit server")
        start()
      }
    })

    frame.$.pjax({url: "hello.html", container: "#main"})
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

  asyncTest("lazily sets initial $.pjax.state", function() {
    var frame = this.frame

    equal(frame.$.pjax.state, null)

    frame.$('#main').on("pjax:success", function() {
      start()
    })
    frame.$.pjax({
      url: "hello.html",
      container: "#main"
    })

    var initialState = frame.$.pjax.state
    ok(initialState.id)
    equal(initialState.url, "http://" + frame.location.host + "/home.html")
    equal(initialState.container, "#main")
  })

  asyncTest("updates $.pjax.state to new page", function() {
    var frame = this.frame

    frame.$('#main').on("pjax:success", function() {
      var state = frame.$.pjax.state
      ok(state.id)
      equal(state.url, "http://" + frame.location.host + "/hello.html#new")
      equal(state.container, "#main")
      start()
    })
    frame.$.pjax({
      url: "hello.html#new",
      container: "#main"
    })

    var initialState = frame.$.pjax.state
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

  asyncTest("handles going back to pjaxed state after reloading a fragment navigation", function() {
    var iframe = this.iframe
    var frame = this.frame
    var supportsHistoryState = 'state' in window.history

    // Get some pjax state in the history.
    frame.$.pjax({
      url: "hello.html",
      container: "#main",
    })
    frame.$("#main").on("pjax:complete", function() {
      var state = frame.history.state
      ok(frame.$.pjax.state)
      if (supportsHistoryState)
        ok(frame.history.state)

      // Navigate to a fragment, which will result in a new history entry with
      // no state object. $.pjax.state remains unchanged however.
      iframe.src = frame.location.href + '#foo'
      ok(frame.$.pjax.state)
      if (supportsHistoryState)
        ok(!frame.history.state)

      // Reload the frame. This will clear out $.pjax.state.
      frame.location.reload()
      $(iframe).one("load", function() {
        ok(!frame.$.pjax.state)
        if (supportsHistoryState)
          ok(!frame.history.state)

        // Go back to #main. We'll get a popstate event with a pjax state
        // object attached from the initial pjax navigation, even though
        // $.pjax.state is null.
        window.iframeLoad = function() {
          ok(frame.$.pjax.state)
          if (supportsHistoryState) {
            ok(frame.history.state)
            equal(frame.$.pjax.state.id, state.id)
          }
          start()
        }
        frame.history.back()
      })
    })
  })

  asyncTest("handles going back to page after loading an error page", function() {
    var frame = this.frame
    var iframe = this.iframe

    equal(frame.location.pathname, "/home.html")
    equal(frame.document.title, "Home")

    $(iframe).one("load", function() {

      window.iframeLoad = function() {
        equal(frame.location.pathname, "/home.html")
        equal(frame.document.title, "Home")

        start()
      }

      frame.history.back()
    })

    frame.$.pjax({
      url: "boom_sans_pjax.html",
      container: "#main"
    })
  })
}

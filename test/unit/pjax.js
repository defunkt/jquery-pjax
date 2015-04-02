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

  asyncTest("pushes new url", 2, function() {
    navigate(this.frame)
    .pjax({ url: "hello.html", container: "#main", cache: false }, function(frame) {
      equal(frame.location.pathname, "/hello.html")
      equal(frame.location.search, "")
    })
  })

  asyncTest("replaces container html from response data", 2, function() {
    navigate(this.frame)
    .pjax({ url: "hello.html", container: "#main" }, function(frame) {
      equal(frame.$("#main > p").html().trim(), "Hello!")
      equal(frame.$("#main").contents().eq(1).text().trim(), "How's it going?")
    })
  })

  asyncTest("sets title to response title tag", 2, function() {
    navigate(this.frame)
    .pjax({ url: "hello.html", container: "#main" }, function(frame) {
      equal(frame.document.title, "Hello")
      equal(frame.$("#main title").length, 0)
    })
  })

  asyncTest("sets title to response nested title tag", 2, function() {
    navigate(this.frame)
    .pjax({ url: "nested_title.html", container: "#main" }, function(frame) {
      equal(frame.document.title, "Hello")
      equal(frame.$("#main title").length, 0)
    })
  })

  asyncTest("sets title to response last title tag", 2, function() {
    navigate(this.frame)
    .pjax({ url: "double_title.html", container: "#main" }, function(frame) {
      equal(frame.document.title, "World!")
      equal(frame.$("#main title").length, 0)
    })
  })

  asyncTest("scrolls to top of page", 2, function() {
    this.frame.scrollTo(0, 100)
    equal(this.frame.pageYOffset, 100)

    navigate(this.frame)
    .pjax({ url: "long.html", container: "#main" }, function(frame) {
      equal(frame.pageYOffset, 0)
    })
  })

  asyncTest("scrollTo: false avoids changing current scroll position", 2, function() {
    this.frame.scrollTo(0, 100)
    equal(this.frame.pageYOffset, 100)

    navigate(this.frame)
    .pjax({ url: "long.html", scrollTo: false, container: "#main" }, function(frame) {
      equal(frame.window.pageYOffset, 100)
    })
  })

  asyncTest("evals scripts", 7, function() {
    var externalLoadedCount = 0
    this.frame.externalScriptLoaded = function() {
      externalLoadedCount++
    }

    navigate(this.frame)
    .pjax({ url: "scripts.html?name=one", container: "#main" }, function(frame) {
      deepEqual(frame.evaledInlineLog, ["one"])
      equal(externalLoadedCount, 0)
      return new PoorMansPromise(function(resolve) {
        setTimeout(resolve, 100)
      }).then(function() {
        equal(externalLoadedCount, 2, "expected scripts to have loaded")
      })
    })
    .pjax({ url: "scripts.html?name=two", container: "#main" }, function(frame) {
      deepEqual(frame.evaledInlineLog, ["one", "two"])
    })
    .back(-1, function(frame) {
      deepEqual(frame.evaledInlineLog, ["one", "two", "one"])
    })
    .back(+1, function(frame) {
      deepEqual(frame.evaledInlineLog, ["one", "two", "one", "two"])
      return new PoorMansPromise(function(resolve) {
        setTimeout(resolve, 100)
      }).then(function() {
        equal(externalLoadedCount, 2, "expected no extra scripts to load")
      })
    })
  })

  asyncTest("container option accepts jQuery object", 1, function() {
    var container = this.frame.$("#main")

    navigate(this.frame)
    .pjax({ url: "hello.html", container: container }, function(frame) {
      equal(frame.$("#main > p").html().trim(), "Hello!")
    })
  })

  asyncTest("container option accepts DOM element with ID", 1, function() {
    var container = this.frame.document.getElementById("main")

    navigate(this.frame)
    .pjax({ url: "hello.html", container: container }, function(frame) {
      equal(frame.$("#main > p").html().trim(), "Hello!")
    })
  })

  asyncTest("url option accepts function", 2, function() {
    var numCalls = 0
    var url = function() {
      numCalls++
      return "hello.html"
    }

    navigate(this.frame)
    .pjax({ url: url, container: "#main" }, function(frame) {
      equal(frame.$("#main > p").html().trim(), "Hello!")
      equal(numCalls, 1)
    })
  })

  asyncTest("sets X-PJAX header on XHR request", 1, function() {
    navigate(this.frame)
    .pjax({ url: "env.html", container: "#main" }, function(frame) {
      var env = JSON.parse(frame.$("#env").text())
      equal(env["HTTP_X_PJAX"], "true")
    })
  })

  asyncTest("sets X-PJAX-Container header to container on XHR request", 1, function() {
    navigate(this.frame)
    .pjax({ url: "env.html", container: "#main" }, function(frame) {
      var env = JSON.parse(frame.$("#env").text())
      equal(env["HTTP_X_PJAX_CONTAINER"], "#main")
    })
  })

  asyncTest("sets hidden _pjax param on XHR GET request", 1, function() {
    navigate(this.frame)
    .pjax({ data: undefined, url: "env.html", container: "#main" }, function(frame) {
      var env = JSON.parse(frame.$("#env").text())
      equal(env["rack.request.query_hash"]["_pjax"], "#main")
    })
  })

  asyncTest("sets hidden _pjax param if array data is supplied", 1, function() {
    var data = [{ name: "foo", value: "bar" }]

    navigate(this.frame)
    .pjax({ data: data, url: "env.html", container: "#main" }, function(frame) {
      var env = JSON.parse(frame.$("#env").text())
      deepEqual(env["rack.request.query_hash"], {
        "_pjax": "#main"
      , "foo": "bar"
      })
    })
  })

  asyncTest("sets hidden _pjax param if object data is supplied", 1, function() {
    var data = { foo: "bar" }

    navigate(this.frame)
    .pjax({ data: data, url: "env.html", container: "#main" }, function(frame) {
      var env = JSON.parse(frame.$("#env").text())
      deepEqual(env["rack.request.query_hash"], {
        "_pjax": "#main"
      , "foo": "bar"
      })
    })
  })

  asyncTest("preserves query string on GET request", 3, function() {
    navigate(this.frame)
    .pjax({ url: "env.html?foo=1&bar=2", container: "#main" }, function(frame) {
      equal(frame.location.pathname, "/env.html")
      equal(frame.location.search, "?foo=1&bar=2")

      var env = JSON.parse(frame.$("#env").text())
      deepEqual(env["rack.request.query_hash"], {
        "_pjax": "#main"
      , "foo": "1"
      , "bar": "2"
      })
    })
  })

  asyncTest("GET data is appended to query string", 6, function() {
    var data = { foo: 1, bar: 2 }

    navigate(this.frame)
    .pjax({ data: data, url: "env.html", container: "#main" }, function(frame) {
      equal(frame.location.pathname, "/env.html")
      equal(frame.location.search, "?foo=1&bar=2")

      var env = JSON.parse(frame.$("#env").text())
      deepEqual(env["rack.request.query_hash"], {
        "_pjax": "#main"
      , "foo": "1"
      , "bar": "2"
      })
    })

    var frame = this.frame
    setTimeout(function() {
      // URL is set immediately
      equal(frame.location.pathname, "/env.html")
      equal(frame.location.search, "?foo=1&bar=2")
      equal(frame.location.href.indexOf("#"), -1)
    }, 0)
  })

  asyncTest("GET data is merged into query string", 6, function() {
    var data = { bar: 2 }

    navigate(this.frame)
    .pjax({ data: data, url: "env.html?foo=1", container: "#main" }, function(frame) {
      equal(frame.location.pathname, "/env.html")
      equal(frame.location.search, "?foo=1&bar=2")

      var env = JSON.parse(frame.$("#env").text())
      deepEqual(env["rack.request.query_hash"], {
        "_pjax": "#main"
      , "foo": "1"
      , "bar": "2"
      })
    })

    var frame = this.frame
    setTimeout(function() {
      // URL is set immediately
      equal(frame.location.pathname, "/env.html")
      equal(frame.location.search, "?foo=1&bar=2")
      equal(frame.location.href.indexOf("#"), -1)
    }, 0)
  })

  asyncTest("mixed containers", 6, function() {
    navigate(this.frame)
    .pjax({ url: "fragment.html", container: "#main" })
    .pjax({ url: "aliens.html", container: "#foo" }, function(frame) {
      equal(frame.$("#main > #foo > ul > li").last().text(), "aliens")
    })
    .back(-1, function(frame) {
      equal(frame.$("#main > #foo").text().trim(), "Foo")
    })
    .pjax({ url: "env.html", replace: true, fragment: "#env", container: "#bar" }, function(frame) {
      // This replaceState shouldn't affect restoring other popstates
      equal(frame.$("#main > #foo").text().trim(), "Foo")
      ok(JSON.parse(frame.$("#bar").text()))
    })
    .back(-1, function(frame) {
      equal(frame.$("#main > ul > li").first().text(), "home")
    })
    .back(+1)
    .back(+1, function(frame) {
      equal(frame.$("#main > #foo > ul > li").last().text(), "aliens")
    })
  })

  asyncTest("only fragment is inserted", 2, function() {
    navigate(this.frame)
    .pjax({ url: "hello.html?layout=true", fragment: "#main", container: "#main" }, function(frame) {
      equal(frame.$("#main > p").html().trim(), "Hello!")
      equal(frame.document.title, "Hello")
    })
  })

  asyncTest("use body as fragment", 2, function() {
    navigate(this.frame)
    .pjax({ url: "hello.html?layout=true", fragment: "body", container: "body" }, function(frame) {
      equal(frame.$("body > #main > p").html().trim(), "Hello!")
      equal(frame.document.title, "Hello")
    })
  })

  asyncTest("fragment sets title to response title attr", 2, function() {
    navigate(this.frame)
    .pjax({ url: "fragment.html", fragment: "#foo", container: "#main" }, function(frame) {
      equal(frame.$("#main > p").html(), "Foo")
      equal(frame.document.title, "Foo")
    })
  })

  asyncTest("fragment sets title to response data-title attr", 2, function() {
    navigate(this.frame)
    .pjax({ url: "fragment.html", fragment: "#bar", container: "#main" }, function(frame) {
      equal(frame.$("#main > p").html(), "Bar")
      equal(frame.document.title, "Bar")
    })
  })

  asyncTest("missing fragment falls back to full load", 2, function() {
    var iframe = this.iframe

    navigate(this.frame)
    .pjax({ url: "hello.html?layout=true", fragment: "#missing", container: "#main" }, function() {
      return new PoorMansPromise(function(resolve) {
        iframe.onload = function() { resolve(this.contentWindow) }
      }).then(function(frame) {
        equal(frame.$("#main p").html(), "Hello!")
        equal(frame.location.pathname, "/hello.html")
      })
    })
  })

  asyncTest("missing data falls back to full load", 2, function() {
    var iframe = this.iframe

    navigate(this.frame)
    .pjax({ url: "empty.html", container: "#main" }, function() {
      return new PoorMansPromise(function(resolve) {
        iframe.onload = function() { resolve(this.contentWindow) }
      }).then(function(frame) {
        equal(frame.$("#main").html().trim(), "")
        equal(frame.location.pathname, "/empty.html")
      })
    })
  })

  asyncTest("full html page falls back to full load", 2, function() {
    var iframe = this.iframe

    navigate(this.frame)
    .pjax({ url: "hello.html?layout=true", container: "#main" }, function() {
      return new PoorMansPromise(function(resolve) {
        iframe.onload = function() { resolve(this.contentWindow) }
      }).then(function(frame) {
        equal(frame.$("#main p").html(), "Hello!")
        equal(frame.location.pathname, "/hello.html")
      })
    })
  })

  asyncTest("header version mismatch does a full load", 2, function() {
    var iframe = this.iframe
    this.frame.$.pjax.defaults.version = "v2"

    navigate(this.frame)
    .pjax({ url: "hello.html", container: "#main" }, function() {
      return new PoorMansPromise(function(resolve) {
        iframe.onload = function() { resolve(this.contentWindow) }
      }).then(function(frame) {
        equal(frame.$("#main p").html(), "Hello!")
        equal(frame.location.pathname, "/hello.html")
      })
    })
  })

  asyncTest("triggers pjax:start/end events from container", 12, function() {
    var eventLog = []
    var container = this.frame.document.getElementById("main")
    ok(container)

    this.frame.$(container).on("pjax:start pjax:end", function(event, xhr, options) {
      eventLog.push(arguments)
    })

    navigate(this.frame)
    .pjax({ url: "hello.html", container: "#main" }, function(frame) {
      equal(eventLog.length, 2)
      $.each(["pjax:start", "pjax:end"], function(i, expectedType) {
        (function(event, xhr, options){
          equal(event.type, expectedType)
          equal(event.target, container)
          equal(event.relatedTarget, null)
          equal(typeof xhr.abort, "function")
          equal(options.url, "hello.html")
        }).apply(this, eventLog[i])
      })
    })
  })

  asyncTest("events preserve explicit target as relatedTarget", 7, function() {
    var eventLog = []
    var container = this.frame.document.getElementById("main")
    ok(container)

    this.frame.$(container).on("pjax:start pjax:end", function(event, xhr, options) {
      eventLog.push(event)
    })

    navigate(this.frame)
    .pjax({ url: "hello.html", target: container, container: "#main" }, function(frame) {
      $.each(["pjax:start", "pjax:end"], function(i, expectedType) {
        var event = eventLog[i]
        equal(event.type, expectedType)
        equal(event.target, container)
        equal(event.relatedTarget, container)
      })
    })
  })

  asyncTest("stopping pjax:beforeSend prevents the request", 6, function() {
    var eventLog = []
    var container = this.frame.document.getElementById("main")
    ok(container)

    this.frame.$(container).on("pjax:beforeSend", function(event, xhr, settings) {
      eventLog.push(arguments)
      return false
    })

    navigate(this.frame)
    .pjax({ url: "hello.html", container: "#main" }, function(frame) {
      ok(false)
    })

    setTimeout(function() {
      equal(eventLog.length, 1)
      ;(function(event, xhr, settings){
        equal(event.type, "pjax:beforeSend")
        equal(event.target, container)
        equal(typeof xhr.abort, "function")
        equal(settings.dataType, "html")
      }).apply(this, eventLog[0])
      start()
    }, 100)
  })

  asyncTest("triggers pjax:beforeReplace event from container", 9, function() {
    var eventLog = []
    var container = this.frame.document.getElementById("main")
    ok(container)

    this.frame.$(container).on("pjax:beforeReplace", function(event, contents, options) {
      eventLog.push(arguments)
      equal(container.textContent.indexOf("Hello!"), -1)
    })

    var urlPrefix = location.protocol + "//" + location.host

    navigate(this.frame)
    .pjax({ url: "hello.html", container: "#main" }, function(frame) {
      equal(eventLog.length, 1)

      ;(function(event, contents, options){
        equal(event.target, container)
        equal(event.state.url, urlPrefix + "/hello.html")
        equal(event.previousState.url, urlPrefix + "/home.html")
        equal(contents[0].nodeName, "P")
        // FIXME: Should this be absolute URL?
        equal(options.url, "hello.html")
      }).apply(this, eventLog[0])

      ok(container.textContent.indexOf("Hello!") >= 0)
    })
  })

  asyncTest("triggers pjax:success/complete events from container", function() {
    var eventLog = []
    var container = this.frame.document.getElementById("main")
    ok(container)

    this.frame.$(container).on("pjax:success pjax:complete", function(event) {
      eventLog.push(arguments)
    })

    navigate(this.frame)
    .pjax({ url: "hello.html", container: "#main" }, function(frame) {
      equal(eventLog.length, 2)

      ;(function(event, data, status, xhr, options){
        equal(event.type, "pjax:success")
        equal(event.target, container)
        ok(data.indexOf("<p>Hello!</p>") >= 0)
        equal(status, "success")
        equal(typeof xhr.abort, "function")
        equal(options.url, "hello.html")
      }).apply(this, eventLog[0])

      ;(function(event, xhr, status, options){
        equal(event.type, "pjax:complete")
        equal(event.target, container)
        equal(typeof xhr.abort, "function")
        equal(status, "success")
        equal(options.url, "hello.html")
      }).apply(this, eventLog[1])
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

  asyncTest("popstate going back/forward in history", 14, function() {
    var eventLog = []
    var container = this.frame.document.getElementById("main")
    ok(container)

    this.frame.$(container).on("pjax:popstate", function(event) {
      eventLog.push(event)
    })

    navigate(this.frame)
    .pjax({ url: "hello.html", container: "#main" }, function(frame) {
      equal(frame.location.pathname, "/hello.html")
      equal(frame.document.title, "Hello")
      equal(eventLog.length, 0)
    })
    .back(-1, function(frame) {
      equal(frame.location.pathname, "/home.html")
      equal(frame.document.title, "Home")
      equal(eventLog.length, 1)
      equal(eventLog[0].direction, "back")
      equal(eventLog[0].state.container, "#main")
    })
    .back(+1, function(frame) {
      equal(frame.location.pathname, "/hello.html")
      equal(frame.document.title, "Hello")
      equal(eventLog.length, 2)
      equal(eventLog[1].direction, "forward")
      equal(eventLog[1].state.container, "#main")
    })
  })

  asyncTest("popstate restores original scroll position", 2, function() {
    this.frame.scrollTo(0, 100)
    equal(this.frame.pageYOffset, 100)

    navigate(this.frame)
    .pjax({ url: "long.html", container: "#main" }, function(frame) {
      equal(frame.pageYOffset, 0)
    })
    .back(-1, function(frame) {
      // FIXME: Seems like this functionality is natively broken in PhantomJS and Safari
      // equal(frame.pageYOffset, 100)
    })
  })

  asyncTest("popstate triggers pjax:beforeReplace event", 10, function() {
    var eventLog = []
    var container = this.frame.document.getElementById("main")
    ok(container)

    this.frame.$(container).on("pjax:beforeReplace", function(event, contents, options) {
      eventLog.push(arguments)
      if (eventLog.length == 2) {
        equal(container.textContent.indexOf("home"), -1)
      }
    })

    var urlPrefix = location.protocol + "//" + location.host

    navigate(this.frame)
    .pjax({ url: "hello.html", container: "#main" })
    .back(-1, function(frame) {
      equal(eventLog.length, 2)

      // FIXME: First "pjax:beforeReplace" event has relative URL,
      // while the 2nd (triggered by popstate) has absolute URL.
      equal(eventLog[0][2].url, "hello.html")

      ;(function(event, contents, options){
        equal(event.target, container)
        equal(event.previousState.url, urlPrefix + "/hello.html")
        equal(event.state.url, urlPrefix + "/home.html")
        equal(contents[1].nodeName, "UL")
        equal(options.url, urlPrefix + "/home.html")
      }).apply(this, eventLog[1])

      ok(container.textContent.indexOf("home") >= 0)
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

  asyncTest("copes with ampersands when pushing urls", 2, function() {
    navigate(this.frame)
    .pjax({ url: "/some-&-path/hello.html", container: "#main" }, function(frame) {
      equal(frame.location.pathname, "/some-&-path/hello.html")
      equal(frame.location.search, "")
    })
  })
}

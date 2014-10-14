if ($.support.pjax) {
  module("handleSubmit", {
    setup: function() {
      var self = this
      stop()
      window.iframeLoad = function(frame) {
        self.frame = frame
        window.iframeLoad = $.noop
        start()
      }
      $("#qunit-fixture").append("<iframe src='basic_form.html'>")
    },
    teardown: function() {
      delete window.iframeLoad
    }
  })

  asyncTest("Form POST records submitting element's value", function() {
    var frame = this.frame

    frame.$("#main")
      .on("pjax:end", function() {
        equal(frame.$("#submit").text(), "submit value")
        start()
      })

    frame.$("[name='submit']").click()
  })

  module("handleSubmit (multiple submit buttons)", {
    setup: function() {
      var self = this
      stop()
      window.iframeLoad = function(frame) {
        self.frame = frame
        window.iframeLoad = $.noop
        start()
      }
      $("#qunit-fixture").append("<iframe src='form.html'>")
    },
    teardown: function() {
      delete window.iframeLoad
    }
  })

  asyncTest("Form POST records submitting element's value", function() {
    var frame = this.frame

    frame.$("#main")
      .on("pjax:end", function() {
        equal(frame.$("#submit").text(), "submit value")
        start()
      })

    frame.$("input[name='submit']").click()
  })

  asyncTest("Form POST records submitting element's value, when input is a button", function() {
    var frame = this.frame

    frame.$("#main")
      .on("pjax:end", function() {
        equal(frame.$("#submit").text(), "submit value")
        start()
      })

    frame.$("button[name='submit']").click()
  })

  module("handleSubmit (multiple forms)", {
    setup: function() {
      var self = this
      stop()
      window.iframeLoad = function(frame) {
        self.frame = frame
        window.iframeLoad = $.noop
        start()
      }
      $("#qunit-fixture").append("<iframe src='multiple_forms.html'>")
    },
    teardown: function() {
      delete window.iframeLoad
    }
  })

  asyncTest("Form POST records submitting element's value", function() {
    var frame = this.frame

    frame.$("#main")
      .on("pjax:end", function() {
        equal(frame.$("#submit").text(), "submit value")
        start()
      })

    frame.$("#form2 [name='submit']").click()
  })
}

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

    frame.$("[name='submit']").click()
  })
}

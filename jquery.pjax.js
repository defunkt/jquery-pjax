// jquery.pjax.js
// copyright chris wanstrath
// https://github.com/defunkt/jquery-pjax

(function($){

// When called on a link, fetches the href with ajax into the
// container specified as the first parameter or with the data-pjax
// attribute on the link itself.
//
// Tries to make sure the back button and ctrl+click work the way
// you'd expect.
//
// Accepts a jQuery ajax options object that may include these
// pjax specific options:
//
// container - Where to stick the response body. Usually a String selector.
//             $(container).html(xhr.responseBody)
//      push - Whether to pushState the URL. Defaults to true (of course).
//   replace - Want to use replaceState instead? That's cool.
//  fallback - Set to 'ajax' if you want to proceed with ajax loading in
//             browsers that don't support window.history.pushState
//
// For convenience the first parameter can be either the container or
// the options object.
//
// Returns the jQuery object
$.fn.pjax = function( container, options ) {
  if ( options )
    options.container = container
  else
    options = $.isPlainObject(container) ? container : {container:container}

  return this.live('click', function(event){
    // Middle click, cmd click, and ctrl click should open
    // links in a new tab as normal.
    if ( event.which > 1 || event.metaKey )
      return true

    var defaults = {
      url: this.href,
      container: $(this).attr('data-pjax'),
      clickedElement: $(this),
      fallback: $.pjax.fallback
    }

    options = $.extend({}, defaults, options)

    if ( $.pjax.browserIsSupported() || options.fallback == 'ajax' ) {
      $.pjax(options)

      event.preventDefault()
    }
    else {
      return this
    }
  })
}


// Loads a URL with ajax, puts the response body inside a container,
// then pushState()'s the loaded URL.
//
// Works just like $.ajax in that it accepts a jQuery ajax
// settings object (with keys like url, type, data, etc).
//
// Accepts these extra keys:
//
// container - Where to stick the response body.
//             $(container).html(xhr.responseBody)
//      push - Whether to pushState the URL. Defaults to true (of course).
//   replace - Want to use replaceState instead? That's cool.
//  fallback - What to do on browsers that don't support history.pushState:
//               'ajax': perform ajax loading
//               'location': redirect to given url
//               null (default): give up, do nothing
//             Can be set globally like:
//               $.pjax.fallback = 'ajax'
//
// Use it just like $.ajax:
//
//   var xhr = $.pjax({ url: this.href, container: '#main' })
//   console.log( xhr.readyState )
//
// Returns whatever $.ajax returns.
$.pjax = function( options ) {
  var $container = $(options.container),
      success = options.success || $.noop

  // We don't want to let anyone override our success handler.
  delete options.success

  var defaults = {
    timeout: 650,
    push: true,
    replace: false,
    // We want the browser to maintain two separate internal caches: one for
    // pjax'd partial page loads and one for normal page loads. Without
    // adding this secret parameter, some browsers will often confuse the two.
    data: { _pjax: true },
    type: 'GET',
    dataType: 'html',
    fallback: $.pjax.fallback,
    beforeSend: function(xhr){
      $container.trigger('start.pjax')
      xhr.setRequestHeader('X-PJAX', 'true')
    },
    error: function(){
      window.location = options.url
    },
    complete: function(){
      $container.trigger('end.pjax')
    },
    success: function(data){
      // If we got no data or an entire web page, go directly
      // to the page and let normal error handling happen.
      if ( !$.trim(data) || /<html/i.test(data) )
        return window.location = options.url

      // Make it happen.
      $container.html(data)

      // If there's a <title> tag in the response, use it as
      // the page's title.
      var oldTitle = document.title,
          title = $.trim( $container.find('title').remove().text() )
      if ( title ) document.title = title

      var state = {
        pjax: options.container,
        timeout: options.timeout
      }

      // We can't persist $objects using the history API so we need to store
      // the string selector.
      if ( $.isPlainObject(state.pjax) )
        state.pjax = state.pjax.selector

      // If there are extra params, save the complete URL in the state object
      var query = $.param(options.data)
      if ( query != "_pjax=true" )
        state.url = options.url + (/\?/.test(options.url) ? "&" : "?") + query

      if ( $.pjax.browserIsSupported() ) {
        if ( options.replace ) {
          window.history.replaceState(state, document.title, options.url)
        } else if ( options.push ) {
          // this extra replaceState before first push ensures good back
          // button behavior
          if ( !$.pjax.active ) {
            window.history.replaceState($.extend({}, state, {url:null}),
                                        oldTitle)
            $.pjax.active = true
          }

          window.history.pushState(state, document.title, options.url)
        }
      }

      // Google Analytics support
      if ( (options.replace || options.push) && window._gaq )
        _gaq.push(['_trackPageview', options.url])

      // Invoke their success handler if they gave us one.
      success.apply(this, arguments)
    }
  }

  options = $.extend(true, {}, defaults, options)

  if ( $.isFunction(options.url) ) {
    options.url = options.url()
  }

  if ( !$.pjax.browserIsSupported() && options.fallback != 'ajax' ) {
    if ( options.fallback == 'location' ) {
      window.location = options.url
    }
    else {
      return
    }
  }

  // Cancel the current request if we're already pjaxing
  var xhr = $.pjax.xhr
  if ( xhr && xhr.readyState < 4) {
    xhr.onreadystatechange = $.noop
    xhr.abort()
  }

  $.pjax.xhr = $.ajax(options)
  $(document).trigger('pjax', $.pjax.xhr, options)

  return $.pjax.xhr
}

$.pjax.browserIsSupported = function() {
  return window.history && window.history.pushState
}

$.pjax.fallback = null;


// Used to detect initial (useless) popstate.
// If history.state exists, assume browser isn't going to fire initial popstate.
var popped = ('state' in window.history), initialURL = location.href


// popstate handler takes care of the back and forward buttons
//
// You probably shouldn't use pjax on pages with other pushState
// stuff yet.
$(window).bind('popstate', function(event) {
  // Ignore inital popstate that some browsers fire on page load
  var initialPop = !popped && location.href == initialURL
  popped = true
  if ( initialPop ) return

  var state = event.state

  if ( state && state.pjax ) {
    var $container = $(state.pjax+'')
    if ( $container.length )
      $.pjax({
        url: state.url || location.href,
        container: $container,
        push: false,
        timeout: state.timeout
      })
    else
      window.location = location.href
  }
})


// Add the state property to jQuery's event object so we can use it in
// $(window).bind('popstate')
if ( $.inArray('state', $.event.props) < 0 )
  $.event.props.push('state')

})(jQuery);

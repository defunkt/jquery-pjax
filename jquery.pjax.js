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

  // We can't persist $objects using the history API so we must use
  // a String selector. Bail if we got anything else.
  if ( options.container && typeof options.container !== 'string' ) {
    throw "pjax container must be a string selector!"
    return false
  }

  return this.live('click', function(event){
    // Middle click, cmd click, and ctrl click should open
    // links in a new tab as normal.
    if ( event.which > 1 || event.metaKey )
      return true

    var defaults = {
      url: this.href,
      container: $(this).attr('data-pjax'),
      clickedElement: $(this),
      fragment: null
    }

    $.pjax($.extend({}, defaults, options))

    event.preventDefault()
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
// container - Where to stick the response body. Must be a String.
//             $(container).html(xhr.responseBody)
//      push - Whether to pushState the URL. Defaults to true (of course).
//   replace - Want to use replaceState instead? That's cool.
//
// Use it just like $.ajax:
//
//   var xhr = $.pjax({ url: this.href, container: '#main' })
//   console.log( xhr.readyState )
//
// Returns whatever $.ajax returns.
var pjax = $.pjax = function( options ) {
  var $container = $(options.container),
      success = options.success || $.noop

  // We don't want to let anyone override our success handler.
  delete options.success

  // We can't persist $objects using the history API so we must use
  // a String selector. Bail if we got anything else.
  if ( typeof options.container !== 'string' )
    throw "pjax container must be a string selector!"

  options = $.extend(true, {}, pjax.defaults, options)

  if ( $.isFunction(options.url) ) {
    options.url = options.url()
  }

  options.context = $container

  options.success = function(data){
    if ( options.fragment ) {
      // If they specified a fragment, look for it in the response
      // and pull it out.
      var $fragment = $(data).find(options.fragment)
      if ( $fragment.length )
        data = $fragment.children()
      else
        return window.location = options.url
    } else {
        // If we got no data or an entire web page, go directly
        // to the page and let normal error handling happen.
        if ( !$.trim(data) || /<html/i.test(data) )
          return window.location = options.url
    }

    // Make it happen.
    this.html(data)

    // If there's a <title> tag in the response, use it as
    // the page's title.
    var oldTitle = document.title,
        title = $.trim( this.find('title').remove().text() )
    if ( title ) document.title = title

    // No <title>? Fragment? Look for data-title and title attributes.
    if ( !title && options.fragment ) {
      title = $fragment.attr('title') || $fragment.data('title')
    }

    var state = {
      pjax: options.container,
      fragment: options.fragment,
      timeout: options.timeout
    }

    // If there are extra params, save the complete URL in the state object
    var query = $.param(options.data)
    if ( query != "_pjax=true" )
      state.url = options.url + (/\?/.test(options.url) ? "&" : "?") + query

    if ( options.replace ) {
      window.history.replaceState(state, document.title, options.url)
    } else if ( options.push ) {
      // this extra replaceState before first push ensures good back
      // button behavior
      if ( !pjax.active ) {
        window.history.replaceState($.extend({}, state, {url:null}), oldTitle)
        pjax.active = true
      }

      window.history.pushState(state, document.title, options.url)
    }

    // Google Analytics support
    if ( (options.replace || options.push) && window._gaq )
      _gaq.push(['_trackPageview'])

    // If the URL has a hash in it, make sure the browser
    // knows to navigate to the hash.
    var hash = window.location.hash.toString()
    if ( hash !== '' ) {
      window.location.href = hash
    }

    // Invoke their success handler if they gave us one.
    success.apply(this, arguments)
  }

  // Cancel the current request if we're already pjaxing
  var xhr = pjax.xhr
  if ( xhr && xhr.readyState < 4) {
    xhr.onreadystatechange = $.noop
    xhr.abort()
  }

  pjax.options = options
  pjax.xhr = $.ajax(options)
  $(document).trigger('pjax', [pjax.xhr, options])

  return pjax.xhr
}


pjax.defaults = {
  timeout: 650,
  push: true,
  replace: false,
  // We want the browser to maintain two separate internal caches: one for
  // pjax'd partial page loads and one for normal page loads. Without
  // adding this secret parameter, some browsers will often confuse the two.
  data: { _pjax: true },
  type: 'GET',
  dataType: 'html',
  beforeSend: function(xhr){
    this.trigger('pjax:start', [xhr, pjax.options])
    // start.pjax is deprecated
    this.trigger('start.pjax', [xhr, pjax.options])
    xhr.setRequestHeader('X-PJAX', 'true')
  },
  error: function(xhr, textStatus, errorThrown){
    if ( textStatus !== 'abort' )
      window.location = pjax.options.url
  },
  complete: function(xhr){
    this.trigger('pjax:end', [xhr, pjax.options])
    // end.pjax is deprecated
    this.trigger('end.pjax', [xhr, pjax.options])
  }
}


// Used to detect initial (useless) popstate.
// If history.state exists, assume browser isn't going to fire initial popstate.
var popped = ('state' in window.history), initialURL = location.href


// popstate handler takes care of the back and forward buttons
//
// You probably shouldn't use pjax on pages with other pushState
// stuff yet.
$(window).bind('popstate', function(event){
  // Ignore inital popstate that some browsers fire on page load
  var initialPop = !popped && location.href == initialURL
  popped = true
  if ( initialPop ) return

  var state = event.state

  if ( state && state.pjax ) {
    var container = state.pjax
    if ( $(container+'').length )
      $.pjax({
        url: state.url || location.href,
        fragment: state.fragment,
        container: container,
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


// Is pjax supported by this browser?
$.support.pjax =
  window.history && window.history.pushState && window.history.replaceState
  // pushState isn't reliable on iOS yet.
  && !navigator.userAgent.match(/(iPod|iPhone|iPad|WebApps\/.+CFNetwork)/)


// Fall back to normalcy for older browsers.
if ( !$.support.pjax ) {
  $.pjax = function( options ) {
    window.location = $.isFunction(options.url) ? options.url() : options.url
  }
  $.fn.pjax = function() { return this }
}

})(jQuery);

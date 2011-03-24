// jquery.pjax.js
// copyright chris wanstrath
// https://github.com/defunkt/pjax

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
jQuery.fn.pjax = function( container, options ) {
  var $ = jQuery

  if ( options )
    options.container = container
  else
    options = $.isPlainObject(container) ? container : {container:container}

  return this.live('click', function(event){
    // Middle click, cmd click, and ctrl click should open
    // links in a new tab as normal.
    if ( event.which == 2 || event.metaKey )
      return true

    var defaults = {
      url: this.href,
      container: $(this).attr('data-pjax')
    }

    $.pjax($.extend({}, defaults, options))

    event.preventDefault()
  })
}


// Loads a URL with ajax, puts the response body inside a container,
// then pushState()'s the loaded URL. Also ensures the back button
// works the way you'd expect.
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
//
// Use it just like $.ajax:
//
//   var xhr = $.pjax({ url: this.href, container: '#main' })
//   console.log( xhr.readyState )
//
// Returns whatever $.ajax returns.
jQuery.pjax = function( options ) {
  // Helper
  var $ = jQuery, $container = $(options.container)

  var defaults = {
    timeout: 650,
    push: true,
    replace: false,
    type: 'GET',
    dataType: 'html',
    beforeSend: function(xhr){
      xhr.setRequestHeader('X-PJAX', 'true')
    },
    error: function(){ window.location = options.url },
    success: function( data ) {
      // If we got no data or an entire web page, go directly
      // to the page and let normal error handling happen.
      if ( !$.trim(data) || /<html/i.test(data) )
        return window.location = options.url

      // Make it happen.
      $container.html(data)

      // If there's a <title> tag in the response, use it as
      // the page's title.
      var title = $.trim( $container.find('title').remove().text() )
      if ( title ) document.title = title

      var state = { pjax: options.container }

      if ( options.data )
        state.url = options.url + '?' + $.param(options.data)

      if ( options.replace ) {
        window.history.replaceState(state, document.title, options.url)
      } else if ( options.push ) {
        window.history.pushState(state, document.title, options.url)
      }

      if ( (options.replace || options.push) && window._gaq )
        _gaq.push(['_trackPageview'])

      // Invoke their success handler if they gave us one.
      success.apply(this, arguments)
    }
  }

  // We don't want to let anyone override our success handler.
  var success = options.success || $.noop
  delete options.success

  options = $.extend(true, {}, defaults, options)
  var xhr = $.ajax(options)

  $(document).trigger('pjax', xhr, options)
  return xhr
}


// onpopstate fires at some point after the first page load, by design.
// pjax only cares about the back button, so we ignore the first onpopstate.
//
// Of course, older webkit doesn't fire the onopopstate event on load.
// So we have to special case. The joys.
jQuery.pjax.firstLoad = true

if ( jQuery.browser.webkit && parseInt(jQuery.browser.version) < 534 )
  jQuery.pjax.firstLoad = false


// Bind our popstate handler which takes care of the back and
// forward buttons, but only once we've called pjax().
//
// You probably shouldn't use pjax on pages with other pushState
// stuff yet.
jQuery(window).bind('popstate', function(event){
  if ( jQuery.pjax.firstLoad )
    return jQuery.pjax.firstLoad = false

  var state = event.state

  if ( state && $(state.pjax).length )
    jQuery.pjax({
      url: state.url || location.href,
      container: state.pjax,
      push: false
    })
  else
    window.location = location.href
})


// Add the state property to jQuery's event object so we can use it in
// $(window).bind('popstate')
jQuery.event.props.push('state')


// Fall back to normalcy for older browsers.
if ( !window.history || !window.history.pushState ) {
  jQuery.pjax = jQuery.fn.pjax = $.noop
};
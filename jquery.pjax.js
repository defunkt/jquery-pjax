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
//   loading - A callback to fire after it's been too many ms and
//             you want to ease the user's pain with a loading indicator.
//             You can also bind to the 'loading.pjax' event on container.
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
    options = $.isPlainObject(container) ? container : { container: container }

  $(this).live('click', function(){
    // Middle click, cmd click, and ctrl click should open
    // links in a new tab as normal.
    if ( event.which == 2 || event.metaKey )
      return true

    var defaults = {
      url: this.href,
      container: $(this).attr('data-pjax')
    }

    $.pjax( $.extend({}, defaults, options) )

    return false
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
//   loading - A callback to fire after it's been too many ms and
//             you want to ease the user's pain with a loading indicator.
//             You can also bind to the 'loading.pjax' event on container.
//      push - Whether to pushState the URL. Defaults to true (of course).
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
    data: { pjax: true },
    type: 'GET',
    dataType: 'html',
    error: function(){ window.location = options.url },
    success: function(data){
      // If we got no data or an entire web page, go directly
      // to the page and let normal error handling happen.
      if ( !$.trim(data) || /<html/i.test(data) )
        return window.location = options.url

      // Make it happen.
      $container.html( data )

      // If there's a <title> tag in the response, use it as
      // the page's title.
      var title = $.trim( $container.find('title').remove().text() )
      if ( title ) document.title = title


      if ( options.replace ) {
        window.history.replaceState( { pjax: options.container },
                                     document.title, options.url )
      } else if ( options.push !== false ) {
        // If they didn't explicitly disable `push`, call pushState()
        window.history.pushState( { pjax: options.container },
                                  document.title, options.url )
      }

      // Invoke their success handler if they gave us one.
      success.apply( this, arguments )
    }
  }

  // We don't want to let anyone override our success handler.
  var success = options.success || $.noop
  delete options.success

  if ( options.loading )
    $container.bind('loading.pjax', options.loading)

  options = $.extend( true, {}, defaults, options )
  var xhr = $.ajax( options )

  // If we haven't found what we're looking for after a buncha ms
  // you might want to show a 'Loading...' indicator.
  setTimeout(function(){
    if ( xhr.readyState == 4 ) return
    $container.trigger('loading.pjax')
  }, 350)

  $(document).trigger('pjax', xhr, options)
  return xhr
}

// Bind our popstate handler which takes care of the back and
// forward buttons, but only once we've called pjax()
jQuery(document).one('pjax', function(){
  jQuery(window).bind('popstate', function(event){
    var state = event.state
    if ( state && state.pjax && $(state.pjax).length )
      jQuery.pjax({ url: location.href, container: state.pjax, push: false })
    else
      window.location = location.href
  })
})

// Add the state property to jQuery's event object so we can use it in
// $(window).bind('popstate')
jQuery.event.props.push('state')

// Fall back to normalcy for older browsers.
if ( !window.history || !window.history.pushState ) {
  jQuery.pjax = jQuery.fn.pjax = $.noop
}

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
  return this.live('click.pjax', function(event){
    handleClick(event, container, options)
  })
}

// Public: pjax on click handler
//
// Exported as $.pjax.click.
//
// event   - "click" jQuery.Event
// options - pjax options
//
// Examples
//
//   $('a').live('click', $.pjax.click)
//   // is the same as
//   $('a').pjax()
//
//  $(document).on('click', 'a', function(event) {
//    var container = $(this).closest('[data-pjax-container]')
//    return $.pjax.click(event, container)
//  })
//
// Returns false if pjax runs, otherwise nothing.
function handleClick(event, container, options) {
  options = optionsFor(container, options)

  var link = event.currentTarget

  if (link.tagName.toUpperCase() !== 'A')
    throw "$.fn.pjax or $.pjax.click requires an anchor element"

  // Middle click, cmd click, and ctrl click should open
  // links in a new tab as normal.
  if ( event.which > 1 || event.metaKey || event.ctrlKey )
    return

  // Ignore cross origin links
  if ( location.protocol !== link.protocol || location.host !== link.host )
    return

  // Ignore anchors on the same page
  if ( link.hash && link.href.replace(link.hash, '') ===
       location.href.replace(location.hash, '') )
    return

  var defaults = {
    url: link.href,
    container: $(link).attr('data-pjax'),
    target: link,
    clickedElement: $(link), // DEPRECATED: use target
    fragment: null
  }

  $.pjax($.extend({}, defaults, options))

  event.preventDefault()
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
//
// Use it just like $.ajax:
//
//   var xhr = $.pjax({ url: this.href, container: '#main' })
//   console.log( xhr.readyState )
//
// Returns whatever $.ajax returns.
var pjax = $.pjax = function( options ) {
  options = $.extend(true, {}, $.ajaxSettings, pjax.defaults, options)

  if ($.isFunction(options.url)) {
    options.url = options.url()
  }

  var target = options.target

  // DEPRECATED: use options.target
  if (!target && options.clickedElement) target = options.clickedElement[0]

  var hash = parseURL(options.url).hash

  // DEPRECATED: Save references to original event callbacks. However,
  // listening for custom pjax:* events is prefered.
  var oldBeforeSend = options.beforeSend,
      oldComplete   = options.complete,
      oldSuccess    = options.success,
      oldError      = options.error

  var context = options.context = findContainerFor(options.container)

  // We want the browser to maintain two separate internal caches: one
  // for pjax'd partial page loads and one for normal page loads.
  // Without adding this secret parameter, some browsers will often
  // confuse the two.
  if (!options.data) options.data = {}
  options.data._pjax = context.selector

  function fire(type, args) {
    var event = $.Event(type, { relatedTarget: target })
    context.trigger(event, args)
    return !event.isDefaultPrevented()
  }

  var timeoutTimer

  options.beforeSend = function(xhr, settings) {
    if (settings.timeout > 0) {
      timeoutTimer = setTimeout(function() {
        if (fire('pjax:timeout', [xhr, options]))
          xhr.abort('timeout')
      }, settings.timeout)

      // Clear timeout setting so jquerys internal timeout isn't invoked
      settings.timeout = 0
    }

    xhr.setRequestHeader('X-PJAX', 'true')
    xhr.setRequestHeader('X-PJAX-Container', context.selector)

    var result

    // DEPRECATED: Invoke original `beforeSend` handler
    if (oldBeforeSend) {
      result = oldBeforeSend.apply(this, arguments)
      if (result === false) return false
    }

    if (!fire('pjax:beforeSend', [xhr, settings]))
      return false

    options.requestUrl = parseURL(settings.url).href
  }

  options.complete = function(xhr, textStatus) {
    if (timeoutTimer)
      clearTimeout(timeoutTimer)

    // DEPRECATED: Invoke original `complete` handler
    if (oldComplete) oldComplete.apply(this, arguments)

    fire('pjax:complete', [xhr, textStatus, options])

    fire('pjax:end', [xhr, options])
    // end.pjax is deprecated
    fire('end.pjax', [xhr, options])
  }

  options.error = function(xhr, textStatus, errorThrown) {
    var container = extractContainer("", xhr, options)

    // DEPRECATED: Invoke original `error` handler
    if (oldError) oldError.apply(this, arguments)

    var allowed = fire('pjax:error', [xhr, textStatus, errorThrown, options])
    if (textStatus !== 'abort' && allowed)
      window.location = container.url
  }

  options.success = function(data, status, xhr) {
    var container = extractContainer(data, xhr, options)

    if (!container.contents) {
      window.location = container.url
      return
    }

    pjax.state = {
      id: options.id || uniqueId(),
      url: container.url,
      title: container.title,
      container: context.selector,
      fragment: options.fragment,
      timeout: options.timeout
    }

    if (options.push || options.replace) {
      window.history.replaceState(pjax.state, container.title, container.url)
    }

    if (container.title) document.title = container.title
    context.html(container.contents)

    // Scroll to top by default
    if (typeof options.scrollTo === 'number')
      $(window).scrollTop(options.scrollTo)

    // Google Analytics support
    if ( (options.replace || options.push) && window._gaq )
      _gaq.push(['_trackPageview'])

    // If the URL has a hash in it, make sure the browser
    // knows to navigate to the hash.
    if ( hash !== '' ) {
      window.location.href = hash
    }

    // DEPRECATED: Invoke original `success` handler
    if (oldSuccess) oldSuccess.apply(this, arguments)

    fire('pjax:success', [data, status, xhr, options])
  }


  // Initialize pjax.state for the initial page load. Assume we're
  // using the container and options of the link we're loading for the
  // back button to the initial page. This ensures good back button
  // behavior.
  if (!pjax.state) {
    pjax.state = {
      id: uniqueId(),
      url: window.location.href,
      title: document.title,
      container: context.selector,
      fragment: options.fragment,
      timeout: options.timeout
    }
    window.history.replaceState(pjax.state, document.title)
  }

  // Cancel the current request if we're already pjaxing
  var xhr = pjax.xhr
  if ( xhr && xhr.readyState < 4) {
    xhr.onreadystatechange = $.noop
    xhr.abort()
  }

  pjax.options = options
  var xhr = pjax.xhr = $.ajax(options)

  if (xhr.readyState > 0) {
    // pjax event is deprecated
    $(document).trigger('pjax', [xhr, options])

    if (options.push && !options.replace) {
      // Cache current container element before replacing it
      containerCache.push(pjax.state.id, context.clone(true, true).contents())

      window.history.pushState(null, "", options.url)
    }

    fire('pjax:start', [xhr, options])
    // start.pjax is deprecated
    fire('start.pjax', [xhr, options])

    fire('pjax:send', [xhr, options])
  }

  return pjax.xhr
}


// Internal: Generate unique id for state object.
//
// Use a timestamp instead of a counter since ids should still be
// unique across page loads.
//
// Returns Number.
function uniqueId() {
  return (new Date).getTime()
}

// Internal: Strips _pjax param from url
//
// url - String
//
// Returns String.
function stripPjaxParam(url) {
  return url
    .replace(/\?_pjax=[^&]+&?/, '?')
    .replace(/_pjax=[^&]+&?/, '')
    .replace(/[\?&]$/, '')
}

// Internal: Parse URL components and returns a Locationish object.
//
// url - String URL
//
// Returns HTMLAnchorElement that acts like Location.
function parseURL(url) {
  var a = document.createElement('a')
  a.href = url
  return a
}

// Internal: Build options Object for arguments.
//
// For convenience the first parameter can be either the container or
// the options object.
//
// Examples
//
//   optionsFor('#container')
//   // => {container: '#container'}
//
//   optionsFor('#container', {push: true})
//   // => {container: '#container', push: true}
//
//   optionsFor({container: '#container', push: true})
//   // => {container: '#container', push: true}
//
// Returns options Object.
function optionsFor(container, options) {
  // Both container and options
  if ( container && options )
    options.container = container

  // First argument is options Object
  else if ( $.isPlainObject(container) )
    options = container

  // Only container
  else
    options = {container: container}

  // Find and validate container
  if (options.container)
    options.container = findContainerFor(options.container)

  return options
}

// Internal: Find container element for a variety of inputs.
//
// Because we can't persist elements using the history API, we must be
// able to find a String selector that will consistently find the Element.
//
// container - A selector String, jQuery object, or DOM Element.
//
// Returns a jQuery object whose context is `document` and has a selector.
function findContainerFor(container) {
  container = $(container)

  if ( !container.length ) {
    throw "no pjax container for " + container.selector
  } else if ( container.selector !== '' && container.context === document ) {
    return container
  } else if ( container.attr('id') ) {
    return $('#' + container.attr('id'))
  } else {
    throw "cant get selector for pjax container!"
  }
}

// Internal: Filter and find all elements matching the selector.
//
// Where $.fn.find only matches descendants, findAll will test all the
// top level elements in the jQuery object as well.
//
// elems    - jQuery object of Elements
// selector - String selector to match
//
// Returns a jQuery object.
function findAll(elems, selector) {
  var results = $()
  elems.each(function() {
    if ($(this).is(selector))
      results = results.add(this)
    results = results.add(selector, this)
  })
  return results
}

// Internal: Extracts container and metadata from response.
//
// 1. Extracts X-PJAX-URL header if set
// 2. Extracts inline <title> tags
// 3. Builds response Element and extracts fragment if set
//
// data    - String response data
// xhr     - XHR response
// options - pjax options Object
//
// Returns an Object with url, title, and contents keys.
function extractContainer(data, xhr, options) {
  var obj = {}

  // Prefer X-PJAX-URL header if it was set, otherwise fallback to
  // using the original requested url.
  obj.url = stripPjaxParam(xhr.getResponseHeader('X-PJAX-URL') || options.requestUrl)

  // Attempt to parse response html into elements
  var $data = $(data)

  // If response data is empty, return fast
  if ($data.length === 0)
    return obj

  // If there's a <title> tag in the response, use it as
  // the page's title.
  obj.title = findAll($data, 'title').last().text()

  if (options.fragment) {
    // If they specified a fragment, look for it in the response
    // and pull it out.
    var $fragment = findAll($data, options.fragment).first()

    if ($fragment.length) {
      obj.contents = $fragment.contents()

      // If there's no title, look for data-title and title attributes
      // on the fragment
      if (!obj.title)
        obj.title = $fragment.attr('title') || $fragment.data('title')
    }

  } else if (!/<html/i.test(data)) {
    obj.contents = $data
  }

  // Clean up any <title> tags
  if (obj.contents) {
    // Remove any parent title elements
    obj.contents = obj.contents.not('title')

    // Then scrub any titles from their descendents
    obj.contents.find('title').remove()
  }

  // Trim any whitespace off the title
  if (obj.title) obj.title = $.trim(obj.title)

  return obj
}

// Public: Reload current page with pjax.
//
// Returns whatever $.pjax returns.
pjax.reload = function(container, options) {
  var defaults = {
    url: window.location.href,
    push: false,
    replace: true,
    scrollTo: false
  }

  return $.pjax($.extend(defaults, optionsFor(container, options)))
}


pjax.defaults = {
  timeout: 650,
  push: true,
  replace: false,
  type: 'GET',
  dataType: 'html',
  scrollTo: 0,
  maxCacheLength: 20
}

// Internal: History DOM caching class.
function Cache() {
  this.mapping      = {}
  this.forwardStack = []
  this.backStack    = []
}
// Push previous state id and container contents into the history
// cache. Should be called in conjunction with `pushState` to save the
// previous container contents.
//
// id    - State ID Number
// value - DOM Element to cache
//
// Returns nothing.
Cache.prototype.push = function(id, value) {
  this.mapping[id] = value
  this.backStack.push(id)

  // Remove all entires in forward history stack after pushing
  // a new page.
  while (this.forwardStack.length)
    delete this.mapping[this.forwardStack.shift()]

  // Trim back history stack to max cache length.
  while (this.backStack.length > pjax.defaults.maxCacheLength)
    delete this.mapping[this.backStack.shift()]
}
// Retrieve cached DOM Element for state id.
//
// id - State ID Number
//
// Returns DOM Element(s) or undefined if cache miss.
Cache.prototype.get = function(id) {
  return this.mapping[id]
}
// Shifts cache from forward history cache to back stack. Should be
// called on `popstate` with the previous state id and container
// contents.
//
// id    - State ID Number
// value - DOM Element to cache
//
// Returns nothing.
Cache.prototype.forward = function(id, value) {
  this.mapping[id] = value
  this.backStack.push(id)

  if (id = this.forwardStack.pop())
    delete this.mapping[id]
}
// Shifts cache from back history cache to forward stack. Should be
// called on `popstate` with the previous state id and container
// contents.
//
// id    - State ID Number
// value - DOM Element to cache
//
// Returns nothing.
Cache.prototype.back = function(id, value) {
  this.mapping[id] = value
  this.forwardStack.push(id)

  if (id = this.backStack.pop())
    delete this.mapping[id]
}

var containerCache = new Cache


// Export $.pjax.click
pjax.click = handleClick


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

  if (state && state.container) {
    var container = $(state.container)
    if (container.length) {
      var contents = containerCache.get(state.id)

      if (pjax.state) {
        // Since state ids always increase, we can deduce the history
        // direction from the previous state.
        var direction = pjax.state.id < state.id ? 'forward' : 'back'

        // Cache current container before replacement and inform the
        // cache which direction the history shifted.
        containerCache[direction](pjax.state.id, container.clone(true, true).contents())
      }

      var popstateEvent = $.Event('pjax:popstate', {
        state: state,
        direction: direction
      })
      container.trigger(popstateEvent)

      var options = {
        id: state.id,
        url: state.url,
        container: container,
        push: false,
        fragment: state.fragment,
        timeout: state.timeout,
        scrollTo: false
      }

      if (contents) {
        // pjax event is deprecated
        $(document).trigger('pjax', [null, options])
        container.trigger('pjax:start', [null, options])
        // end.pjax event is deprecated
        container.trigger('start.pjax', [null, options])

        if (state.title) document.title = state.title
        container.html(contents)
        pjax.state = state

        container.trigger('pjax:end', [null, options])
        // end.pjax event is deprecated
        container.trigger('end.pjax', [null, options])
      } else {
        $.pjax(options)
      }

      // Force reflow/relayout before the browser tries to restore the
      // scroll position.
      container[0].offsetHeight
    } else {
      window.location = location.href
    }
  }
})


// Add the state property to jQuery's event object so we can use it in
// $(window).bind('popstate')
if ( $.inArray('state', $.event.props) < 0 )
  $.event.props.push('state')


// Is pjax supported by this browser?
$.support.pjax =
  window.history && window.history.pushState && window.history.replaceState
  // pushState isn't reliable on iOS until 5.
  && !navigator.userAgent.match(/((iPod|iPhone|iPad).+\bOS\s+[1-4]|WebApps\/.+CFNetwork)/)

// Fall back to normalcy for older browsers.
if ( !$.support.pjax ) {
  $.pjax = function( options ) {
    var url = $.isFunction(options.url) ? options.url() : options.url,
        method = options.type ? options.type.toUpperCase() : 'GET'

    var form = $('<form>', {
      method: method === 'GET' ? 'GET' : 'POST',
      action: url,
      style: 'display:none'
    })

    if (method !== 'GET' && method !== 'POST') {
      form.append($('<input>', {
        type: 'hidden',
        name: '_method',
        value: method.toLowerCase()
      }))
    }

    var data = options.data
    if (typeof data === 'string') {
      $.each(data.split('&'), function(index, value) {
        var pair = value.split('=')
        form.append($('<input>', {type: 'hidden', name: pair[0], value: pair[1]}))
      })
    } else if (typeof data === 'object') {
      for (key in data)
        form.append($('<input>', {type: 'hidden', name: key, value: data[key]}))
    }

    $(document.body).append(form)
    form.submit()
  }
  $.pjax.click = $.noop
  $.pjax.reload = window.location.reload
  $.fn.pjax = function() { return this }
}

})(jQuery);

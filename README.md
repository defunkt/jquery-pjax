# pjax = pushState + ajax

pjax is a jQuery plugin that uses ajax and pushState to deliver a fast browsing experience with real permalinks, page titles, and a working back button.

pjax works by fetching HTML from your server via ajax and replacing the content
of a container element on your page with the loaded HTML. It then updates the
current URL in the browser using pushState. This results in faster page
navigation for two reasons:

* No page resources (JS, CSS) get re-executed or re-applied;
* If the server is configured for pjax, it can render only partial page
  contents and thus avoid the potentially costly full layout render.

### Status of this project

jquery-pjax is **largely unmaintained** at this point. It might continue to
receive important bug fixes, but _its feature set is frozen_ and it's unlikely
that it will get new features or enhancements.

## Installation

pjax depends on jQuery 1.8 or higher.

### npm

```
$ npm install jquery-pjax
```

### standalone script

Download and include `jquery.pjax.js` in your web page:

```
curl -LO https://raw.github.com/defunkt/jquery-pjax/master/jquery.pjax.js
```

## Usage

### `$.fn.pjax`

The simplest and most common use of pjax looks like this:

``` javascript
$(document).pjax('a', '#pjax-container')
```

This will enable pjax on all links on the page and designate the container as `#pjax-container`.

If you are migrating an existing site, you probably don't want to enable pjax
everywhere just yet. Instead of using a global selector like `a`, try annotating
pjaxable links with `data-pjax`, then use `'a[data-pjax]'` as your selector. Or,
try this selector that matches any `<a data-pjax href=>` links inside a `<div
data-pjax>` container:

``` javascript
$(document).pjax('[data-pjax] a, a[data-pjax]', '#pjax-container')
```

#### Server-side configuration

Ideally, your server should detect pjax requests by looking at the special
`X-PJAX` HTTP header, and render only the HTML meant to replace the contents of
the container element (`#pjax-container` in our example) without the rest of
the page layout. Here is an example of how this might be done in Ruby on Rails:

``` ruby
def index
  if request.headers['X-PJAX']
    render :layout => false
  end
end
```

If you'd like a more automatic solution than pjax for Rails check out [Turbolinks][].

[Check if there is a pjax plugin][plugins] for your favorite server framework.

Also check out [RailsCasts #294: Playing with PJAX][railscasts].

#### Arguments

The synopsis for the `$.fn.pjax` function is:

``` javascript
$(document).pjax(selector, [container], options)
```

1. `selector` is a string to be used for click [event delegation][$.fn.on].
2. `container` is a string selector that uniquely identifies the pjax container.
3. `options` is an object with keys described below.

##### pjax options

key | default | description
----|---------|------------
`timeout` | 650 | ajax timeout in milliseconds after which a full refresh is forced
`push` | true | use [pushState][] to add a browser history entry upon navigation
`replace` | false | replace URL without adding browser history entry
`maxCacheLength` | 20 | maximum cache size for previous container contents
`version` | | a string or function returning the current pjax version
`scrollTo` | 0 | vertical position to scroll to after navigation. To avoid changing scroll position, pass `false`.
`type` | `"GET"` | see [$.ajax][]
`dataType` | `"html"` | see [$.ajax][]
`container` | | CSS selector for the element where content should be replaced
`url` | link.href | a string or function that returns the URL for the ajax request
`target` | link | eventually the `relatedTarget` value for [pjax events](#events)
`fragment` | | CSS selector for the fragment to extract from ajax response

You can change the defaults globally by writing to the `$.pjax.defaults` object:

``` javascript
$.pjax.defaults.timeout = 1200
```

### `$.pjax.click`

This is a lower level function used by `$.fn.pjax` itself. It allows you to get a little more control over the pjax event handling.

This example uses the current click context to set an ancestor element as the container:

``` javascript
if ($.support.pjax) {
  $(document).on('click', 'a[data-pjax]', function(event) {
    var container = $(this).closest('[data-pjax-container]')
    var containerSelector = '#' + container.id
    $.pjax.click(event, {container: containerSelector})
  })
}
```

**NOTE** Use the explicit `$.support.pjax` guard. We aren't using `$.fn.pjax` so we should avoid binding this event handler unless the browser is actually going to use pjax.

### `$.pjax.submit`

Submits a form via pjax.

``` javascript
$(document).on('submit', 'form[data-pjax]', function(event) {
  $.pjax.submit(event, '#pjax-container')
})
```

### `$.pjax.reload`

Initiates a request for the current URL to the server using pjax mechanism and replaces the container with the response. Does not add a browser history entry.

``` javascript
$.pjax.reload('#pjax-container', options)
```

### `$.pjax`

Manual pjax invocation. Used mainly when you want to start a pjax request in a handler that didn't originate from a click. If you can get access to a click `event`, consider `$.pjax.click(event)` instead.

``` javascript
function applyFilters() {
  var url = urlForFilters()
  $.pjax({url: url, container: '#pjax-container'})
}
```

## Events

All pjax events except `pjax:click` & `pjax:clicked` are fired from the pjax
container element.

<table>
<tr>
  <th>event</th>
  <th>cancel</th>
  <th>arguments</th>
  <th>notes</th>
</tr>
<tr>
  <th colspan=4>event lifecycle upon following a pjaxed link</th>
</tr>
<tr>
  <td><code>pjax:click</code></td>
  <td>✔︎</td>
  <td><code>options</code></td>
  <td>fires from a link that got activated; cancel to prevent pjax</td>
</tr>
<tr>
  <td><code>pjax:beforeSend</code></td>
  <td>✔︎</td>
  <td><code>xhr, options</code></td>
  <td>can set XHR headers</td>
</tr>
<tr>
  <td><code>pjax:start</code></td>
  <td></td>
  <td><code>xhr, options</code></td>
  <td></td>
</tr>
<tr>
  <td><code>pjax:send</code></td>
  <td></td>
  <td><code>xhr, options</code></td>
  <td></td>
</tr>
<tr>
  <td><code>pjax:clicked</code></td>
  <td></td>
  <td><code>options</code></td>
  <td>fires after pjax has started from a link that got clicked</td>
</tr>
<tr>
  <td><code>pjax:beforeReplace</code></td>
  <td></td>
  <td><code>contents, options</code></td>
  <td>before replacing HTML with content loaded from the server</td>
</tr>
<tr>
  <td><code>pjax:success</code></td>
  <td></td>
  <td><code>data, status, xhr, options</code></td>
  <td>after replacing HTML content loaded from the server</td>
</tr>
<tr>
  <td><code>pjax:timeout</code></td>
  <td>✔︎</td>
  <td><code>xhr, options</code></td>
  <td>fires after <code>options.timeout</code>; will hard refresh unless canceled</td>
</tr>
<tr>
  <td><code>pjax:error</code></td>
  <td>✔︎</td>
  <td><code>xhr, textStatus, error, options</code></td>
  <td>on ajax error; will hard refresh unless canceled</td>
</tr>
<tr>
  <td><code>pjax:complete</code></td>
  <td></td>
  <td><code>xhr, textStatus, options</code></td>
  <td>always fires after ajax, regardless of result</td>
</tr>
<tr>
  <td><code>pjax:end</code></td>
  <td></td>
  <td><code>xhr, options</code></td>
  <td></td>
</tr>
<tr>
  <th colspan=4>event lifecycle on browser Back/Forward navigation</th>
</tr>
<tr>
  <td><code>pjax:popstate</code></td>
  <td></td>
  <td></td>
  <td>event <code>direction</code> property: &quot;back&quot;/&quot;forward&quot;</td>
</tr>
<tr>
  <td><code>pjax:start</code></td>
  <td></td>
  <td><code>null, options</code></td>
  <td>before replacing content</td>
</tr>
<tr>
  <td><code>pjax:beforeReplace</code></td>
  <td></td>
  <td><code>contents, options</code></td>
  <td>right before replacing HTML with content from cache</td>
</tr>
<tr>
  <td><code>pjax:end</code></td>
  <td></td>
  <td><code>null, options</code></td>
  <td>after replacing content</td>
</tr>
</table>

`pjax:send` & `pjax:complete` are a good pair of events to use if you are implementing a
loading indicator. They'll only be triggered if an actual XHR request is made,
not if the content is loaded from cache:

``` javascript
$(document).on('pjax:send', function() {
  $('#loading').show()
})
$(document).on('pjax:complete', function() {
  $('#loading').hide()
})
```

An example of canceling a `pjax:timeout` event would be to disable the fallback
timeout behavior if a spinner is being shown:

``` javascript
$(document).on('pjax:timeout', function(event) {
  // Prevent default timeout redirection behavior
  event.preventDefault()
})
```

## Advanced configuration

### Reinitializing plugins/widget on new page content

The whole point of pjax is that it fetches and inserts new content _without_
refreshing the page. However, other jQuery plugins or libraries that are set to
react on page loaded event (such as `DOMContentLoaded`) will not pick up on
these changes. Therefore, it's usually a good idea to configure these plugins to
reinitialize in the scope of the updated page content. This can be done like so:

``` js
$(document).on('ready pjax:end', function(event) {
  $(event.target).initializeMyPlugin()
})
```

This will make `$.fn.initializeMyPlugin()` be called at the document level on
normal page load, and on the container level after any pjax navigation (either
after clicking on a link or going Back in the browser).

### Response types that force a reload

By default, pjax will force a full reload of the page if it receives one of the
following responses from the server:

* Page content that includes `<html>` when `fragment` selector wasn't explicitly
  configured. Pjax presumes that the server's response hasn't been properly
  configured for pjax. If `fragment` pjax option is given, pjax will extract the
  content based on that selector.

* Page content that is blank. Pjax assumes that the server is unable to deliver
  proper pjax contents.

* HTTP response code that is 4xx or 5xx, indicating some server error.

### Affecting the browser URL

If the server needs to affect the URL which will appear in the browser URL after
pjax navigation (like HTTP redirects work for normal requests), it can set the
`X-PJAX-URL` header:

``` ruby
def index
  request.headers['X-PJAX-URL'] = "http://example.com/hello"
end
```

### Layout Reloading

Layouts can be forced to do a hard reload when assets or html changes.

First set the initial layout version in your header with a custom meta tag.

``` html
<meta http-equiv="x-pjax-version" content="v123">
```

Then from the server side, set the `X-PJAX-Version` header to the same.

``` ruby
if request.headers['X-PJAX']
  response.headers['X-PJAX-Version'] = "v123"
end
```

Deploying a deploy, bumping the version constant to force clients to do a full reload the next request getting the new layout and assets.


[$.fn.on]: http://api.jquery.com/on/
[$.ajax]: http://api.jquery.com/jQuery.ajax/
[pushState]: https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Manipulating_the_browser_history#Adding_and_modifying_history_entries
[plugins]: https://gist.github.com/4283721
[turbolinks]: https://github.com/rails/turbolinks
[railscasts]: http://railscasts.com/episodes/294-playing-with-pjax

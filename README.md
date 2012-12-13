# pjax


            .--.
           /    \
          ## a  a
          (   '._)
           |'-- |
         _.\___/_   ___pjax___
       ."\> \Y/|<'.  '._.-'
      /  \ \_\/ /  '-' /
      | --'\_/|/ |   _/
      |___.-' |  |`'`
        |     |  |
        |    / './
       /__./` | |
          \   | |
           \  | |
           ;  | |
           /  | |
     jgs  |___\_.\_
          `-"--'---'

## pjax = pushState + ajax

pjax loads HTML from your server into the current page without a full reload. It's ajax with real permalinks, page titles, and a working back button that fully degrades.

pjax enhances the browsing experience - nothing more.

## Installation

### bower

Via [bower](https://github.com/twitter/bower).

```
$ bower install jquery-pjax
```

Or add `jquery-pjax` to your apps `component.json`.

``` json
  "dependencies": {
    "jquery-pjax": "latest"
  }
```

### standalone

Since theres only one file, you can just download it directly into your apps public directory. Just be sure to have jQuery loaded first.

```
curl -O https://raw.github.com/defunkt/jquery-pjax/master/jquery.pjax.js
```

**WARNING** Do not hotlink the raw script url. GitHub is not a CDN.

## Dependencies

Requires jQuery 1.7.x and higher.

## Compatibility

pjax only works with [browsers that support the `history.pushState` API](http://caniuse.com/#search=pushstate). However, there is a fallback mode for browsers that don't. `$.fn.pjax` calls will be a no-op and `$.pjax` will hard load the given url. This mode targets the browser requirements of the jQuery version being used.

For debugging purposes, you can intentionally disable pjax even if the browser supports `pushState`. Just call `$.pjax.disable()`. To see if pjax is actually supports `pushState`, check `$.support.pjax`.

## Usage

pjax is not fully automatic. You'll need to setup and designate a containing element on your page that will be replaced when you navigate between pages.

Consider the following page.

``` html
<!DOCTYPE html>
<html>
<head>
  <!-- styles, scripts, etc -->
</head>
<body>
  <h1>My Site</h1>
  <div class="container" id="pjax-container">
    Go to <a href="/page/2">next page</a>.
  </div>
</body>
</html>
```

pjax speeds up page loads by cutting out parts of the page that stay the same. If we want to load `/page/2`, its using the same styles and scripts, so we can skip those. And it actually has the same `<h1>` header. We can skip that too. So, we actually only need to load the new content that changes inside the `.container` element.

So our pjax request only makes an ajax request that gets that new inner contents, and just replaces that element.

Almost magic. Well, you'll need to configure you server to know about pjax requests and only send back that content. If you'd like a more automatic solution, check out [Turbolinks](https://github.com/rails/turbolinks).

### `$.fn.pjax`

The most basic thing to get started with is

``` javascript
$(document).pjax('a', '#pjax-container');
```

This will enable pjax on all links (probably not what you'll actually want) and designate the container as `#pjax-container`.

If you are migrating an existing site, you probably can't just enable pjax everywhere just yet. So try annotating links that do work with pjax with `data-pjax`. Then use `'a[data-pjax]'` as your selector.

Or try this selector thats matches any `<a data-pjax href=>` link and any link inside a container like `<div data-pjax><a href=>`.

``` javascript
$(document).pjax('[data-pjax] a, a[data-pjax]', '#pjax-container');
```

When invoking `$.fn.pjax`, theres a few different argument styles you can pass in.

1. The first argument will always be a `String` selector used for delegation.
2. The second argument can either be a `String` container selector or an options object.
3. If theres three arguments, the second will be used as the container and the third will be the options object.

### `$.pjax.click`

Is a lower level function used by `$.fn.pjax` itself. It allows you to get a little more control over the pjax event handling.

This example uses the current click context to set an ancestor as the container.

``` javascript
if ($.support.pjax) {
  $(document).on('click', 'a[data-pjax]', function(event) {
    var container = $(this).closest('[data-pjax-container]');
    $.pjax.click(event, {container: container});
  });
}
```

**NOTE** The explicit `$.support.pjax` guard. Since we aren't using `$.fn.pjax`, we should avoid binding this event handler unless the browser is actually going to use pjax.

### `$.pjax.submit`

Submits a form via pjax. This function is still considered experimental, but give it a shot!

``` javascript
$(document).on('submit', 'form[data-pjax]', function(event) {
  $.pjax.submit(event, '#pjax-container');
})
```

### `$.pjax`

Manual pjax invocation. Used mainly when you want to start a pjax request in a handler that didn't originate from a click. If you can get access to a click `event`, consider `$.pjax.click(event)` instead.

``` javascript
function applyFilters() {
  var url = urlForFilters();
  $.pjax({url: url, container: '#pjax-container'});
}
```

### Events

No matter which way you invoke pjax, it will fire the following events.

All events are fired from the container, not the link was clicked.

#### start and end

* `pjax:start` - Fired when pjaxing begins
* `pjax:end` - Fired when pjaxing ends.

This pair events fire anytime a pjax request starts and finishes. This includes pjaxing on `popstate` and when pages are loaded from cache instead of making a request.

#### ajax related

* `pjax:beforeSend` - Fired before the pjax request begins. Returning false will abort the request.
* `pjax:send` - Fired after the pjax request begins.
* `pjax:complete` - Fired after the pjax request finishes.
* `pjax:success` - Fired after the pjax request succeeds.
* `pjax:error` - Fired after the pjax request fails. Returning false will prevent the the fallback redirect.
* `pjax:timeout` - Fired if after timeout is reached. Returning false will disable the fallback and will wait indefinitely until the response returns.

`send` and `complete` are a good pair of events to use if you are implementing a loading indicator. They'll only be triggered if an actual request is made, not if its loaded from cache.

``` javascript
$(document).on('pjax:send', function() {
  $('#loading').show();
});
$(document).on('pjax:complete', function() {
  $('#loading').hide();
});
```

Another protip would be disabling the fallback timeout behavior if a spinner is being shown.

``` javascript
$(document).on('pjax:timeout', function(event) {
  // Prevent default timeout redirection behavior
  event.preventDefault();
});
```

### Server side

Server configuration will vary between languages and frameworks. The following example shows how you might configure Rails.

``` ruby
def index
  if request.headers['X-PJAX']
    render :layout => false
  end
end
```

An `X-PJAX` request header is set to differentiate a pjax request from normal XHR requests. In this case, if the request is pjax, we skip the layout html and just render the inner contents of the container.

### Legacy API

Pre 1.0 versions used an older style syntax that was analogous to the now deprecated `$.fn.live` api. The current api is based off `$.fn.on`.

``` javascript
$('a[data-pjax]').pjax('#pjax-container');
```

Expanded to

``` javascript
$('a[data-pjax]').live('click', function(event) {
  $.pjax.click(event, '#pjax-container');
});
```

The new api

``` javascript
$(document).pjax('a[data-pjax]', '#pjax-container');
```

Which is roughly the same as

``` javascript
$(document).on('click', 'a[data-pjax]', function(event) {
  $.pjax.click(event, '#pjax-container');
});
```

**NOTE** That the new api gives you control over the delegated element container. `$.fn.live` always bound to `document`. This is what you still want to do most of the time.

## Contributing

```
$ git clone https://github.com/defunkt/jquery-pjax.git
$ cd jquery-pjax/
```

To run the test suite locally, start up the Sinatra test application.

```
$ ruby test/app.rb 
== Sinatra/1.3.2 has taken the stage on 4567 for development with backup from WEBrick

$ open http://localhost:4567/
```

## See Also

* Rails - [pjax_rails](https://github.com/rails/pjax_rails)
* Django - [django-pjax](https://github.com/jacobian/django-pjax)
* Turbolinks - [turbolinks](https://github.com/rails/turbolinks)

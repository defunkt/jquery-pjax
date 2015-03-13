# Contributing

For running the tests, you will need:

* Ruby 1.9.3+ with Bundler
* PhantomJS (for headless testing)

First run bootstrap to ensure necessary dependencies:

```
$ script/bootstrap
```

Then run headless tests in the console:

```
$ script/test [<test-file>]
```

To run tests in other browsers, start a server:

```
$ script/server
# now open http://localhost:4567/
```

## Test structure

There are 3 main test modules:

* `test/unit/fn_pjax.js` - Primarily tests the `$.fn.pjax` method and its options
* `test/unit/pjax.js` - Main comprehensive pjax functionality tests
* `test/unit/pjax_fallback.js` - Tests that verify same result after navigation
  even if pjax is disabled (like for browsers that don't support pushState).

Each test drives a hidden test page in an `<iframe>`. See other tests to see how
they trigger pjax by using the `frame` reference and remember to do so as well.

$(function() {
  $(':checkbox').prop('checked', sessionStorage['pjax'])

  if ( !$(':checkbox').prop('checked') )
    $.fn.pjax = $.pjax.submit = $.noop

  $(':checkbox').change(function() {
    if ( $.pjax == $.noop ) {
      $(this).removeProp('checked')
      return alert( "Sorry, your browser doesn't support pjax :(" )
    }
    if ( $(this).prop('checked') )
      sessionStorage['pjax'] = true
    else
      sessionStorage['pjax'] = ''

    window.location = location.href
  })
});

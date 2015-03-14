$(function() {
  $(':checkbox').prop('checked', sessionStorage['pjax'])

  if ( !$(':checkbox').prop('checked') )
    $.pjax.disable()

  $(':checkbox').change(function() {
    if ( !$.support.pjax ) {
      this.checked = false
      return alert( "Sorry, your browser doesn't support pjax :(" )
    }
    if ( $(this).prop('checked') )
      sessionStorage['pjax'] = true
    else
      sessionStorage['pjax'] = ''

    window.location = location.href
  })
});

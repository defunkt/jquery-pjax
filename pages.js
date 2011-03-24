$(function() {
  $(':checkbox').attr('checked', !$.cookie('no-pjax'))

  if ( !$(':checkbox').attr('checked') )
    $.fn.pjax = $.noop

  $(':checkbox').change(function() {
    if ( $(this).attr('checked') )
      $.cookie('no-pjax', null)
    else
      $.cookie('no-pjax', true)

    window.location = location.href
  })
});
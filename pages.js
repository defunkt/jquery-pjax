$(function() {
  $(':checkbox').attr('checked', $.cookie('pjax'))

  if ( !$(':checkbox').attr('checked') )
    $.fn.pjax = $.noop

  $(':checkbox').change(function() {
    if ( $(this).attr('checked') )
      $.cookie('pjax', true)
    else
      $.cookie('pjax', null)

    window.location = location.href
  })
});
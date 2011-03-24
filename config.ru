$LOAD_PATH.unshift File.expand_path(File.dirname(__FILE__) + '/app')

require 'pjax'
run Pjax::App.new

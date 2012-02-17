require 'sinatra'

ROOT = File.expand_path("../..", __FILE__)

set :root, ROOT
set :public_folder, ROOT

enable :static

get '/' do
  send_file "#{ROOT}/test/index.html"
end

get '/hello' do
  "<title>Hello</title><p>Hello!</p>"
end

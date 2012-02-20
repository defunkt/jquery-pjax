require 'sinatra'

set :public_folder, settings.root
enable :static

get '/' do
  redirect "/index.html"
end

get '/jquery.pjax.js' do
  send_file "#{settings.root}/../jquery.pjax.js"
end

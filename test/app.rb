require 'sinatra'
require 'json'

set :public_folder, settings.root
enable :static

helpers do
  def pjax?
    env['HTTP_X_PJAX'] && !params[:layout]
  end

  def title(str)
    if pjax?
      "<title>#{str}</title>"
    else
      @title = str
      nil
    end
  end
end

after do
  if pjax?
    response.headers['X-PJAX-URL'] = request.url
    response.headers['X-PJAX-Version'] = 'v1'
  end
end


get '/' do
  erb :qunit
end

get '/jquery.pjax.js' do
  send_file "#{settings.root}/../jquery.pjax.js"
end

get '/test/:file' do
  send_file "#{settings.root}/../test/#{params[:file]}"
end

get '/env.html' do
  erb :env, :layout => !pjax?
end

post '/env.html' do
  erb :env, :layout => !pjax?
end

put '/env.html' do
  erb :env, :layout => !pjax?
end

delete '/env.html' do
  erb :env, :layout => !pjax?
end

get '/redirect.html' do
  redirect "/hello.html"
end

get '/timeout.html' do
  if pjax?
    sleep 1
    erb :timeout, :layout => false
  else
    erb :timeout
  end
end

post '/timeout.html' do
  if pjax?
    sleep 1
    erb :timeout, :layout => false
  else
    status 500
    erb :boom
  end
end

get '/boom.html' do
  status 500
  erb :boom, :layout => !pjax?
end

get '/:page.html' do
  erb :"#{params[:page]}", :layout => !pjax?
end

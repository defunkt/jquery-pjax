require 'sinatra'

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

get '/' do
  erb :qunit
end

get '/jquery.pjax.js' do
  send_file "#{settings.root}/../jquery.pjax.js"
end

get '/timeout.html' do
  if pjax?
    sleep 1
    erb :timeout, :layout => false
  else
    erb :timeout
  end
end

get '/boom.html' do
  status 500
  erb :boom, :layout => !pjax?
end

get '/:page.html' do
  erb :"#{params[:page]}", :layout => !pjax?
end

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

get '/:page.html' do
  erb :"#{params[:page]}", :layout => !pjax?
end

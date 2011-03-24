require 'sinatra'

module Pjax
  class App < Sinatra::Base
    dir = File.dirname(File.expand_path(__FILE__))
    set :root,     "#{dir}/.."
    set :public,   "#{dir}/.."
    set :app_file, __FILE__
    set :views,    "app/views"
    enable :static

    get '/' do
      erb :index, :layout => !pjax?
    end

    get '/:page.html' do
      erb :"#{params[:page]}", :layout => !pjax?
    end

    helpers do
      def title(str)
        if pjax?
          "<title>#{str}</title>"
        else
          @title = str
          nil
        end
      end

      def pjax?
        env['HTTP_X_PJAX']
      end
    end
  end
end

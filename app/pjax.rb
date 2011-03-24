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
      erb :index
    end

    get '/:page.html' do
      erb :"#{params[:page]}"
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
        env['X-PJAX']
      end
    end
  end
end

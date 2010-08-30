MooTools Documentation Browser with Node.js
===========================================

An "alternative" MooTools documentation viewer build with Node.

Instructions
------------

1. Clone the repository

        $ git clone git://github.com/rpflorence/moodocs-browser.git

2. Configure the app.  Open up `config.yml` and specify the paths to the directories you want to be served.  The default looks like this:

        # port you want to the node server to listen to
        port: 8888

        # Doc libraries
        # paths are relative to this file (or absolute)
        docs:
          - '../core'
          - '../more'

    So the docs are siblings of this repository.  You can point to wherever you want.
    
3. Start the server

        $ node server.js


It'll kick out the URLs for each library in the console.
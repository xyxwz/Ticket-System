# Ticket System Client

Backbone.js front-end for the Ticket System API.

## Overview

Code is organized in this structure:

```shell
client
├── css
│   └── less
│       ├── components
│       └── global
├── fonts
├── img
│   ├── assets
│   └── avatars
└── js
    ├── collections
    ├── libs
    │   ├── plugins
    │   └── require
    ├── models
    ├── release
    ├── routers
    ├── support
    ├── templates
    │   ├── alerts
    │   ├── comments
    │   ├── headers
    │   ├── tickets
    │   ├── toolbars
    │   └── widgets
    └── views
        ├── alerts
        ├── comments
        ├── dialogs
        ├── headers
        ├── helpers
        ├── tickets
        ├── toolbars
        └── widgets
```


## Building production client

Must be in the client directory in order to run the build script.

```shell
./build.sh
```


## License

Copyright (c) 2011-2013 TXSSC

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
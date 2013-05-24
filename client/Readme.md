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
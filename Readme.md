TXSSC Ticket System [![Build Status](https://travis-ci.org/TxSSC/Ticket-System.svg?branch=master)](https://travis-ci.org/TxSSC/Ticket-System)
===================

## Overview

The project is split into two parts ***api*** and ***client***, containing the core api code and all front-end code respectively. Documentation for the specific components have a corresponding `Readme`.


## Installing

```shell
npm install
```


## Environment variables

###### NODE_ENV

> Optional

Express environment, see [env](http://expressjs.com/api.html#app-settings)

###### TIX_PORT

> Optional

Port the server starts listening on

###### SESSION_SECRET

> Required

Express session secret, see [sessions](http://www.senchalabs.org/connect/middleware-session.html)

###### CONSUMER_KEY

> Required

OAuth2 strategy consumer key

###### CONSUMER_SECRET

> Required

OAuth2 strategy consumer secret

###### CALLBACK_HOST

> Required

OAuth2 strategy's callback host

###### MONGO_URI

> Required

Mongo connection uri - Ex: `mongodb://127.0.0.1:27017/tickets`

###### REDIS_URI

> Required

Redis connection uri - Ex: `redis://0:@127.0.0.1:6379`

###### TICKETS_PATH

> Required

Base network path for ticket items - Ex: `//myserver/folder/Tickets/`

###### LOCAL_PATH

> Required

Base local path for ticket items - Ex: `/folder/Tickets/`


## Starting the server

Ensure that all dependencies are installed and environment variables set, then execute:

```shell
npm start
```


## Testing

Ensure that all modules are installed and run tests with:

```shell
npm test
```


## License

Copyright (c) 2011-2015 TXSSC

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

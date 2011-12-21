var express = require('express'),
    mongoose = require('mongoose'),
    lib = require('./lib');

var app = module.exports = express.createServer();

app.configure(function(){
  app.set('view engine', 'jade');
  app.set('views', __dirname + '/client');
  app.set('view options', { layout: false });
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: lib.settings.session_secret }));
  app.use(app.router);
  app.use(express.static('../client/'));
});
  

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.db = mongoose.connect('mongodb://localhost/ticket-system-development');
});

app.configure('production', function(){
  app.use(express.errorHandler());
  app.db = mongoose.connect('mongodb://127.0.0.1/ticket-system');
});

app.configure('test', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.db = mongoose.connect('mongodb://localhost/ticket-system-test');
});

// Models
app.models = require('./models');

// Controllers
app.controllers = require('./controllers')(app);

app.listen(3000);

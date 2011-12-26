var express = require('express'),
    mongoose = require('mongoose');


process.env.NODE_ENV = "test";
var app = module.exports = express.createServer();

// Load DB Connection
require('../../conf/configuration.js')(app,express);        
mongoose.connect(app.set('db-uri'));

app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(app.router);

exports.app = app.listen(3000);
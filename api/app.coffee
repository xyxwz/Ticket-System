express = require 'express'
mongoose = require 'mongoose'

app = module.exports = express.createServer()

app.configure () ->
  app.set 'view engine', 'jade'
  app.use express.bodyParser()
  app.use express.methodOverride()
  app.use express.cookieParser()
  app.use express.session({ secret: 'zF0g#n)37ujfTg[|0UQvx#i@fg~gC^xkbM]E7FJNTUM#5G' })
  app.use app.router

app.configure 'development', () ->
  app.use express.errorHandler({
    dumpExceptions: true
    showStack: true
  })

app.configure 'production', () ->
  app.use express.errorHandler()

# Models
app.db = mongoose.connect 'mongodb://127.0.0.1/ticket-system'
app.models = require './models'

# Controllers
app.controllers = require('./controllers')(app)

app.listen(3000)
var fs = require('fs'),
    url = require('url'),
    jade = require('jade'),
    async = require('async'),
    redis = require('redis'),
    mongoose = require('mongoose'),
    nodemailer = require('nodemailer'),
    transport = require('nodemailer-smtp-transport'),
    template = fs.readFileSync(__dirname + '/template.jade');

// Initialize mongoose
mongoose.connect(process.env.MONGO_URI);

var redisUrl = url.parse(process.env.REDIS_URI);
var mockApp = {
  redis: redis.createClient(redisUrl.port, redisUrl.hostname)
};

// Boot models with out mock app
var models = require('../../models')(mockApp);
var template = jade.compile(template, {
  filename: __dirname + '/template.jade',
});

var mailer = nodemailer.createTransport(transport({
  host: 'smtp.txstate.edu',
  port: 25,
  secure: false
}));

// Find all users, and filter/iterate over them
models.User.all(function(err, users) {
  if(err) {
    console.error("Error finding users");
    return;
  }

  async.filter(users, findTickets, function(users) {
    console.log("Sent mail to " + users.length + " users");
    process.exit();
  });
});

/**
 * Find all tickets for `user`
 *
 * @param {Object} user
 * @param {Function} done
 */

function findTickets(user, done) {
  if(!user.settings.email) {
    return done(false);
  }

  models.Ticket.mine(user.id, { status: 'open' }, function(err, tickets) {
    if(err) {
      console.error("Failed to lookup tickets for: " + user.name);
    }

    async.filter(tickets, filterTicket, function(tickets) {
      // send the mail to user
      if(tickets.length > 0) {
        sendMail(user, tickets, function(err) {
          if(err) {
            console.error("Error sending mail to user " + user.name);
          }

          return done(true);
        });
      } else {
        return done(false);
      }
    });
  });
}

/**
 * Does the ticket have a notification?
 *
 * @param {Object} ticket
 * @param {Function} done
 */

function filterTicket(ticket, done) {
  return done(ticket.notification);
}

/**
 * Render the template and send the email
 *
 * @param {Object} user
 * @param {Array} tickets
 * @param {Function} done
 */

function sendMail(user, tickets, done) {
  var html = template({
    user: user,
    tickets: tickets
  });

  mailer.sendMail({
    to: user.email,
    from: 'Ticket-System <noreply@txssc.com>',
    subject: 'Ticket notifications',
    html: html,
  }, done);
}

var ticketModel = require('./models/ticket'),
    user = require('./models/user');

// I hope I did this right
exports.ticketMail = function(user) {
  var nodemailer = require('nodemailer');
  var smtpTransport = require('nodemailer-smtp-transport');

  // Create the transporter for nodemailer module
  var transporter = nodemailer.createTransport(smtpTransport({
    host: 'smtp.txstate.edu',
    port: 25,
    secure: false,
    ignoreTLS: true
  }));

  // This creates the email body from the user's open tickets
  var body = '',
      bodyhtml = '';

  ticketModel.mine(user, {status: 'open'}, function(err, tickets) {
    for(i=0; i<tickets.length; i++) {
      body += tickets[i].title+' - '+tickets[i].opened_at+'\n'+tickets[i].description+'\n\n';
      bodyhtml += '<b>'+tickets[i].title+' - '+tickets[i].opened_at+'</b><br>'+tickets[i].description+'<br><br>';
    }
  });

  // Set defaults for the email
  var mailOptions = {
    from: 'Ticket-System <noreply@txstate.edu>',
    to: user.email,
    subject: 'Open Tickets',
    text: body,
    html: bodyhtml
  };

  // Send the email and log the results
  transporter.sendMail(mailOptions, function(error, info){
    if(error) {
      console.log(error);
    } else {
      console.log('Message sent: ' + info.response);
    }
  });
};
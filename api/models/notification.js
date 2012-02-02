var UserSchema = require('../schemas').User;


 module.exports = function() {


  /*
   * :redis - the redis instance on the app
   * :user - the user.id that is currently logged in
   * :ticket - the ticket.id that is currently being operated on
   *
   */
  var Notification = function(redis, user, ticket) {
    this.redis = redis;
    this.ticket = ticket;
    this.user = user;
    this.ticketRef = this.ticket + '_participating';
    this.userRef = this.user + '_notifications';

    return this;
  };


  /*
   *
   *
   *
   *
   */
  Notification.prototype._isParticipating = function(cb) {
    var length,
        self = this;

    self.redis.SMEMBERS(self.ticketRef, function(err, users) {
      if(err) return cb('Error checking participating users');

      length = users.length;
      users.forEach(function(user, idx) {
        if(user === this.user) return cb(null, true);
        if(idx === length -1) return cb(null, false);
      });
    });
  };


  /*
   *
   *
   *
   * calls cb with err, boolean
   */
  Notification.prototype.hasNotification = function(cb) {
    var length,
        self = this;
    //check all tickets for the user
    self.redis.SMEMBERS(self.userRef, function(err, tickets) {
      if(err) return cb(err);

      length = tickets.length;
      tickets.forEach(function(ticket, idx) {
        if(ticket === self.ticket) return cb(null, true);
        if(idx === length - 1) return cb(null, false);
      });
    });
  };


  /*
   *
   *
   *
   *
   */
  Notification.prototype.push = function(cb) {
    var userRef,
        length,
        self = this;

    self.redis.SMEMBERS(self.ticketRef, function(err, users) {
      if(err) return cb('Error getting participating users');

      length = users.length;
      users.forEach(function(user, idx) {
        if(user !== self.user) {
          userRef = user + '_notifications';
          self.redis.SADD(userRef, self.ticket, function(err) {
            if(err) return cb('Error pushing to users');
          });
        }
        if(idx === length - 1) return cb(null, true);
      });
    });

  };


  /*
   *
   *
   *
   *
   */
  Notification.prototype.remove = function() {
    var self = this;

    self.redis.SREM(self.userRef, self.ticket, function(err) {
      if(err) return cb('Error removing notification');
      return cb(null, true);
    });
  };


  /*
   *
   * Save a user to the participating set
   *
   *
   */
  Notification.prototype.participating = function(cb) {
    var self = this;

    self.redis.SADD(self.ticketRef, self.user, function(err) {
      if(err) return cb('Error adding user to participating');
      return cb(null, true);
    });
  };


  /*
   *
   *
   *
   *
   */
   Notification.prototype.removeParticipating = function(cb) {
     var self = this;

     self.redis.SREM(self.ticketRef, self.user, function(err) {
       if(err) return cb('Error removing user from participating');
       return cb(null, true);
     });
   };


  /*
   *
   *
   *
   *
   */
  Notification.remove = function(redis, user, ticket, cb) {
    var userRef = user + '_notifications';

    redis.SREM(userRef, ticket, function(err) {
      if(err) return cb('Error removing notification');
      return cb(null, true);
    });
  };

  return Notification;
};
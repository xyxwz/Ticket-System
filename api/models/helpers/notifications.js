var P_NAMESPACE = ':participating',
    N_NAMESPACE = ':notifications';


/* ----- Participation functions ----- */

/*
 * All functions use these parameters ->
 *
 * :redis - the redis instance on the app
 * :user - the user.id that is currently logged in
 * :ticket - the ticket.id that is currently being operated on
 * :cb(err, boolean) - function that will be called on return
 */
exports.isParticipating = function(redis, user, ticket, cb) {
  var present = false,
      ticketRef = 'ticket:' + ticket + P_NAMESPACE;

  redis.SMEMBERS(ticketRef, function(err, users) {
    if(err) return cb('Error checking participating users');

    present = users.some(function(userID) {
      return userID === user;
    });

    return cb(null, present);
  });
};


/*
 * Adds the given user into the ticket's participating
 * set.
 */
exports.nowParticipating = function(redis, user, ticket, cb) {
  var ticketRef = 'ticket:' + ticket + P_NAMESPACE;

  redis.SADD(ticketRef, user, function(err, status) {
    if(err) return cb('Error adding user to participating');
    return cb(null, !!status);
  });
};


/*
 * Removes the given user from the ticket's participating
 * set.
 */
exports.removeParticipating = function(redis, user, ticket, cb) {
  var ticketRef = 'ticket:' + ticket + P_NAMESPACE;

  redis.SREM(ticketRef, user, function(err, status) {
    if(err) return cb('Error removing user from participating');
    return cb(null, !!status);
  });
};

/*
 * Reset a ticket's participating set
 */
exports.resetParticipating = function(redis, data, ticket, cb) {
  var ticketRef = 'ticket:' + ticket + P_NAMESPACE;

  redis.DEL(ticketRef, function(err) {
    if(err || !data.length) return cb(err);
    redis.SADD(ticketRef, data, function(err) {
      return cb(err);
    });
  });
};


/* ----- Notification functions ----- */

/*
 * Checks if the given user has a notification for the given
 * ticket.
 */
exports.hasNotification = function(redis, user, ticket, cb) {
  var notify = false,
      userRef = 'user:' + user + N_NAMESPACE;

  //check all tickets for the user
  redis.SMEMBERS(userRef, function(err, tickets) {
    if(err) return cb(err);

    notify = tickets.some(function(tick) {
      return tick.toString() === ticket.toString();
    });

    return cb(null, notify);
  });
};


/*
 * Pushes a notification to all user's ticket set that are
 * present in the ticket's participating users set.
 * The given user is not added.
 * Can be called with a null user to push to all.
 */
exports.pushNotification = function(redis, user, ticket, cb) {
  var tempUserRef,
      error = null,
      userRef = 'user:' + user + N_NAMESPACE,
      ticketRef = 'ticket:' + ticket + P_NAMESPACE;

  redis.SMEMBERS(ticketRef, function(err, users) {
    if(err) return cb('Error getting participating users');
    users.forEach(function(userID) {
      if(userID.toString() !== user.toString()) {
        tempUserRef = 'user:' + userID + ':notifications';
        redis.SADD(tempUserRef, ticket, function(err) {
          if(err) error = 'Error pushing to users';
        });
      }
    });
    return cb(error, error ? false : true);
  });
};


/*
 * Removes the given ticket from the given users notification
 * set.
 */
exports.removeNotification = function(redis, user, ticket, cb) {
  var userRef = 'user:' + user + N_NAMESPACE;

  redis.SREM(userRef, ticket, function(err) {
    if(err) return cb('Error removing notification');
    return cb(null, true);
  });
};


/*
 * Clear all notifications for the user.
 */
exports.clearNotifications = function(redis, user, cb) {
  var userRef = 'user:' + user + N_NAMESPACE;

  redis.DEL(userRef, function(err) {
    if(err) return cb('Error clearing notifications');
    return cb(null, true);
  });
};


/*
 * Clean up all the sets associated with a ticket
 * on deletion.
 */
exports.cleanTicket = function(redis, ticket, cb) {
  var error,
      tempUserRef,
      ticketRef = 'ticket:' + ticket + P_NAMESPACE;

  redis.SMEMBERS(ticketRef, function(err, users) {
    if(err) return cb('Error looking up ticket');

    users.forEach(function(user) {
      tempUserRef = 'user:' + user + N_NAMESPACE;

      redis.SREM(tempUserRef, ticket, function(err) {
        if(err) error = 'Error removing ticket notifications';
      });
    });
    redis.DEL(ticketRef, function(err) {
      if(err) error = 'Error removing ticket set';
      return cb(error, error ? false : true );
    });
  });
};
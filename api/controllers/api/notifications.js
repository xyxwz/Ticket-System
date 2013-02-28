/**
 * Dependencies
 */

var Notifications = require('../../models/helpers').Notifications;

/**
 * API endpoint for notifications
 * - quite poor and inefficient...
 *
 * @param {express.Application} app
 */

module.exports = function(app) {
  var Ticket = app.models.Ticket;

  /**
   * Get users notifications
   *
   * @param {http.Request} req
   * @param {http.Response} res
   */

  app.get('/api/notifications', function(req, res) {
    var i, len,
        notifications = [],
        status = req.query.status || 'open';

    Ticket.mine(req.user._id, {status: status}, function(err, tickets) {
      if(err) return res.json({error: 'Error fetching notifications.'}, 500);
      if(!tickets || !tickets.length) return res.json([], 200);

      for(i = 0, len = tickets.length; i < len; i = i + 1) {
        if(tickets[i].notification) notifications.push({id: tickets[i].id});
      }

      res.json(notifications, 200);
    });
  });

  /**
   * Delete notification with id `:id`
   *
   * @param {http.Request} req
   * @param {http.Response} res
   */

  app.del('/api/notifications/:id', function(req, res) {
    var id = req.params.id;

    Notifications.removeNotification(app.redis, req.user._id, id, function(err) {
      if(err) return res.json({error: 'Error removing notification.'}, 500);
      res.json(200);
    });
  });

  /**
   * Get the assignment status of a ticket -
   * considered unread if `assigned_to.length` === 0
   *
   * @param {http.Request} req
   * @param {http.Response} res
   */

  app.get('/api/unread', function(req, res) {
    var status = req.query.status || 'open';

    Ticket.all(req.user._id, {status: status, read: false}, function(err, tickets) {
      if(err) return res.json({error: 'Error fetching unread statuses.'}, 500);
      if(!tickets || !tickets.length) return res.json([], 200);

      tickets = tickets.map(function(ticket) {
        return {id: ticket.id};
      });

      res.json(tickets, 200);
    });
  });
};
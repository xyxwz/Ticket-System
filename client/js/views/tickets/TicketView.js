/* TicketView
 * Renders a single Ticket
 */

define(['jquery', 'underscore', 'backbone', 'BaseView', 'mustache',
'text!templates/tickets/Ticket.html', 'text!templates/tickets/Timestamp.html',
'text!templates/tickets/AssignedUser.html', 'timeago', 'jqueryui/droppable'],
function($, _, Backbone, BaseView, mustache, TicketTmpl, TimestampTmpl, AssignedUserTmpl) {

  var TicketView = BaseView.extend({
    tagName: 'div',
    className: 'row ticket',

    events: {
      "click #closeTicket": "closeTicket",
    },

    initialize: function() {
      _.bindAll(this);
      this.admin = this.options.admin;

      /* Keep track of who is assigned to this ticket.
       * Because the id's are stored as an array when the 'change'
       * event fires it returns the entire new array. By managing it
       * in an instance variable the UI can update with only the
       * added/removed user and not refresh all assigned users */
      this.assigned_to = this.model.get('assigned_to');

      // Bindings using the garbage collectors bindTo()
      this.bindTo(this.model.comments, 'add', this.updateCommentCount);
      this.bindTo(this.model.comments, 'remove', this.updateCommentCount);
      this.bindTo(this.model.comments, 'reset', this.updateCommentCount);
      this.bindTo(this.model, 'change', this.updateTicket);
      this.bindTo(this.model, 'change:assigned_to', this.addAssignee);
    },

    render: function() {
      // Build up data object for use with view
      var self = this,
          data = this.model.toJSON();

      data.comments = this.model.comments.length;
      data.showAdmin = this.renderAdminOptions(); // True or False
      data.user = ticketer.collections.users.get(this.model.get('user').id).toJSON();
      $(this.el).html(Mustache.to_html(TicketTmpl, data));

      this.setTimestamp();
      this.setAssignedUsers();

      $(this.el).droppable({
        accept: '.assign',
        scope: 'assigned_to',
        drop: function(e, ui) {
          self.model.assignUser(ui.draggable.attr('id'));
        }
      });

      return this;
    },

    /* Set this.admin to true when instantiating a view
     * if admin options are needed. Access control is done on
     * a per view basis by checking currentUser.role
     */
    renderAdminOptions: function() {
      var self = this;

      if(this.admin && this.admin === true) {
        if(ticketer.currentUser.role === 'admin' && self.model.get('status') != 'closed') {
          return true;
        }
        else {
          return false;
        }
      }
    },

    /* Renders the timestamp with the jQuery timeago plugin
     * auto updates */
    setTimestamp: function() {
      if (this.model.get('closed_at')) {
        $('.timestamp', this.el).remove();
        var timestamp = { time: this.model.get('closed_at') };
        $('.ticketName', this.el).append(Mustache.to_html(TimestampTmpl, timestamp));
        $('.timestamp', this.el).prepend('closed: ');
        $('time.timeago', this.el).timeago();
      }
      else {
        var timestamp = { time: this.model.get('opened_at') };
        $('.ticketName', this.el).append(Mustache.to_html(TimestampTmpl, timestamp));
        $('time.timeago', this.el).timeago();
      }
    },

    /* Updates the view's comment count
     * Binded to the model.comments add & remove events
     */
    updateCommentCount: function() {
      $('.commentCount', this.el).html(this.model.comments.length);
    },

    /* Close the ticket using the model's close function */
    closeTicket: function() {
      this.model.close();
    },

    /* Runs on model 'change' event and updates view elements */
    updateTicket: function(model) {
      var changedAttributes = this.model.changedAttributes();

      if(changedAttributes.status) {
        $('#ticketOptions', this.el).fadeOut(100);
      }

      if(changedAttributes.closed_at) {
        this.setTimestamp();
      }
    },

    /* Renders the ticket's assigned users avatars */
    setAssignedUsers: function() {
      var self = this;

      _.each(this.model.get('assigned_to'), function(id) {
        var user = ticketer.collections.users.get(id),
            html = Mustache.to_html(AssignedUserTmpl, user);

        $('.ticketHeader ul', self.el).prepend(html);
      });
    },

    addAssignee: function(id) {
      var self = this,
          newAssignees = _.difference(
            this.model.changedAttributes().assigned_to,
            this.assigned_to
          );

      // Add newly assigned user to this.assigned_to
      _.each(newAssignees, function(user) {
        self.assigned_to.push(user);
      })

      var user = ticketer.collections.users.get(id),
          html = Mustache.to_html(AssignedUserTmpl, user);

      $('.ticketHeader ul', self.el).prepend(html);
    },

  });

  return TicketView;
});
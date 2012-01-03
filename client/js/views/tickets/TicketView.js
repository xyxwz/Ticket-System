/* TicketView
 * Renders a single Ticket
 */

define(['jquery', 'underscore', 'backbone', 'garbage', 'mustache', 'text!templates/tickets/Ticket.html'],
function($, _, Backbone, BaseView, mustache, ticket) {

  var TicketView = BaseView.extend({
    tagName: 'div',
    className: 'row ticket',

    events: {
      "click #closeTicket": "closeTicket",
    },

    initialize: function() {
      _.bindAll(this);
      this.admin = this.options.admin;

      // Bindings using the garbage collectors bindTo()
      this.bindTo(this.model.comments, 'add', this.updateCommentCount);
      this.bindTo(this.model.comments, 'remove', this.updateCommentCount);
      this.bindTo(this.model.comments, 'reset', this.updateCommentCount);
      this.bindTo(this.model, 'change', this.updateTicket);
    },

    render: function() {
      // Build up data object for use with view
      var data = this.model.toJSON();
      data.comments = this.model.comments.length;
      data.showAdmin = this.renderAdminOptions(); // True or False
      data.timestamp = this.setTimestamp();

      $(this.el).html(Mustache.to_html(ticket, data));

      return this;
    },

    /* Set this.admin to true when instantiating a view
     * if admin options are needed. Access control is done on
     * a per view basis by checking currentUsers.role
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

    /* Sets which timestamp to use when rendering the view.
     *    - can be either opened_at or closed_at
     */
    setTimestamp: function() {
      if (this.model.get('closed_at')) {
        return "closed: " + this.model.get('closed_at');
      }
      return this.model.get('opened_at');
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
        timestamp = this.setTimestamp();
        $('hgroup h4', this.el).html(timestamp);
      }
    },

  });

  return TicketView;
});
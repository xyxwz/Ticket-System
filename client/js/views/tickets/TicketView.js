/**
 * TicketView
 * render a single Ticket
 */

define(['jquery', 'underscore', 'mustache', 'BaseView',
  'text!templates/tickets/Ticket.html',
  'text!templates/tickets/EditTicket.html',
  'timeago', 'marked'],
function($, _, mustache, BaseView, TicketTmpl, EditTmpl) {

  var TicketView = BaseView.extend({
    className: 'ticket',

    events: {
      "click .md a": "openLink"
    },

    initialize: function() {
      _.bindAll(this);
      this.admin = this.options.admin;

      $(this.el).attr('data-id', this.model.id);

      this.bindTo(this.model.comments, 'add remove reset', this.updateCommentCount);
      this.bindTo(this.model, 'change', this.render);
    },

    render: function() {
      // Build up data object for use with view
      var self = this,
          data = this.model.toJSON();

      data.description = marked(data.description);
      data.comments = this.model.comments.length;
      data.user = this.model.get('user');
      data.datetime = this.model.get('closed_at') || this.model.get('opened_at');
      data.cleanTime = new Date(data.datetime).toDateString().slice(4);
      data.hoverTime = this.model.responseTime() || data.cleanTime;

      // Closed specific attributes
      if(data.status === 'closed') {
        data.tackClass = 'closed';
        data.isClosed = true;
      }
      else {
        data.tackClass = data.assigned_to.length > 0 ? 'read' : 'unread';
      }

      $(this.el).html(Mustache.to_html(TicketTmpl, data));
      $('time', this.el).timeago();

      return this;
    },

    /**
     * Updates the view's comment count
     * Binded to the model.comments add & remove events
     */

    updateCommentCount: function() {
      $('.commentCount', this.el).html(this.model.comments.length);
    },

    /* open the ticket for editing */
    editTicket: function() {
      var self = this;

      if($('.ticket > .ticket-form', self.el).length === 0) {
        $('.ticketBody').html(Mustache.to_html(EditTmpl, {
          description: self.model.get('description')
        }));

        $('textarea', this.el).autoResize({
          minHeight: 150,
          extraSpace: 14
        });
      }
    },

    saveTicket: function(e) {
      e.preventDefault();

      var self = this,
          description = $('.wrap > textarea', self.el).val();

      $('textarea', this.el).data('AutoResizer').destroy();

      self.model.save({ description: description }, {error: self.triggerViewError, success: self.renderEdit});
    },

    renderEdit: function(e) {
      var self = this;

      if(e instanceof jQuery.Event) {
        e.preventDefault();
      }

      $(this.el).fadeOut(200, function() {
        self.render();
        $(self.el).fadeIn(200);
      });
    },

    // Open links within a ticket body in a new window
    openLink: function(e) {
      e.preventDefault();
      e.stopPropagation();
      window.open(e.currentTarget.href);
    }

  });

  return TicketView;
});
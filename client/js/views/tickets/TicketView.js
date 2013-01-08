/**
 * TicketView
 * render a single Ticket
 */

define(['jquery', 'underscore', 'mustache', 'BaseView',
  'text!templates/tickets/Ticket.html',
  'text!templates/tickets/AssignedUser.html',
  'text!templates/tickets/EditTicket.html',
  'timeago', 'marked'],
function($, _, mustache, BaseView, TicketTmpl, UserTmpl, EditTmpl) {

  var TicketView = BaseView.extend({
    className: 'ticket',

    events: {
      "click .md a": "openLink"
    },

    initialize: function() {
      _.bindAll(this);

      // Render all data for the ticket
      this.renderAll = this.options.renderAll || false;

      // Set the data-id attribute on this.el
      $(this.el).attr('data-id', this.model.id);

      // Bindings
      this.bindTo(this.model, 'change', this.render);
    },

    render: function() {
      // Build up data object for use with view
      var self = this,
          data = this.packageModel();

      $(this.el).html(Mustache.to_html(TicketTmpl, data));
      $('time', this.el).timeago();

      this.renderMeta();

      return this;
    },

    renderMeta: function() {
      var i, len, users, cap = 8,
          assigned = this.model.get('assigned_to'),
          element = $("ul[data-role='assigned-users']", this.$el);

      users = ticketer.collections.admins.filter(function(user) {
        return ~assigned.indexOf(user.id);
      });

      for(i = 0, len = users.length; i < len && cap; i++, cap--) {
        element.append(Mustache.to_html(UserTmpl, users[i].toJSON()));
      }

      return this;
    },

    /**
     * Return the views current model ready to be
     * rendered to the template
     *
     * @return {Object} data
     */

    packageModel: function() {
      var data = {};

      data.title = this.model.get('title');
      data.datetime = this.model.get('closed_at') || this.model.get('opened_at');
      data.cleanTime = new Date(data.datetime).toDateString().slice(4);
      data.hoverTime = this.model.responseTime() || data.cleanTime;
      data.statusClass = this.model.get('assigned_to').length ? 'read' : 'unread';
      data.isClosed = this.model.get('status') === 'closed';

      if(this.renderAll) {
        data.description = marked(this.model.get('description'));
      }

      return data;
    },

    /**
     * open the ticket for editing
     */

    editTicket: function() {
      var self = this,
          editing = $('.ticket .ticket-form', self.el).length === 0;

      if(!editing) {
        $('.body').html(Mustache.to_html(EditTmpl, {
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

      self.model.save({description: description}, {
        error: self.triggerViewError,
        success: self.renderEdit
      });
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
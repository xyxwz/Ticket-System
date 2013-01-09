/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'mustache', 'BaseView',
  'text!templates/tickets/Ticket.html',
  'text!templates/tickets/AssignedUser.html',
  'text!templates/tickets/EditTicket.html',
  'timeago', 'marked'],
function($, _, mustache, BaseView, TicketTmpl, UserTmpl, EditTmpl) {

  /**
   * TicketView
   * render a single Ticket
   *
   * @param {Backbone.Model} model
   * @param {Boolean} renderAll
   */

  var TicketView = BaseView.extend({
    className: 'ticket',

    events: {
      "submit form": "saveTicket",
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
      this.bindTo(this.model, 'edit', this.renderEditForm);
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

    /**
     * Fills the ticket-meta container class with meta-data.
     *
     *
     * Appends all users if renderAll === true,
     * otherwise just renders users up until cap === 0
     */

    renderMeta: function() {
      var len, users, i = 0, cap = 5,
          assigned = this.model.get('assigned_to'),
          element = $("ul[data-role='assigned-users']", this.$el);

      users = ticketer.collections.admins.filter(function(user) {
        return ~assigned.indexOf(user.id);
      });

      len = users.length;

      while((i < len && cap && !this.renderAll) || (i < len && this.renderAll)) {
        element.append(Mustache.to_html(UserTmpl, users[i].toJSON()));
        i = i + 1;
        cap = cap - 1;
      }

      // There are remaining users to render
      if(i !== len) {
        element.append($('<li>...</li>'));
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

    renderEditForm: function() {
      var editing = $('.ticket .ticket-form', this.$el).length;

      if(!editing) {
        $('.content', this.$el).html(Mustache.to_html(EditTmpl, {
          description: this.model.get('description')
        }));

        $('textarea', this.$el).autoResize({
          minHeight: 150,
          extraSpace: 14
        });
      }
    },

    /**
     * Take the data from the current edit form and save
     * it to the current model
     *
     * @param {jQuery.Event} e
     */

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

    /**
     * Re-render the current model after the edit
     * has taken place
     *
     * @param {jQuery.Event} e
     */

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

    /**
     * Open the link in a new window
     *
     * @param {jQuery.Event} e
     */

    openLink: function(e) {
      e.preventDefault();
      e.stopPropagation();
      window.open(e.currentTarget.href);
    }

  });

  return TicketView;
});
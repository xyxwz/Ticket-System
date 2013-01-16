/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'mustache', 'BaseView',
  'views/tickets/TicketMetaView',
  'text!templates/tickets/Ticket.html',
  'text!templates/tickets/AssignedUser.html',
  'text!templates/tickets/EditTicket.html',
  'text!templates/tickets/ClosedNotification.html',
  'text!templates/tickets/AssignedTag.html',
  'moment', 'marked'],
function($, _, mustache, BaseView, TicketMeta, TicketTmpl, UserTmpl, EditTmpl, NotifyTmpl, TagTmpl) {

  /**
   * TicketView
   * render a single Ticket
   *
   * @param {Backbone.Model} model
   * @param {Boolean} renderAll
   */

  var TicketView = BaseView.extend({
    className: 'item ticket',

    events: {
      "click a[data-action]": "ticketAction",
      "submit form": "saveTicket",
      "click .md a": "openLink"
    },

    initialize: function() {
      _.bindAll(this);

      // Render all data for the ticket
      this.renderAll = this.options.renderAll || false;

      // Set the data-id attribute on this.el
      $(this.el).attr('data-id', this.model.id);

      // Bind to List Collection Reset
      // Handles page refreshes where list may render before
      // the collection reset event
      if(!this.renderAll) {
        this.bindTo(ticketer.collections.lists, 'reset', this.renderTags);
        this.bindTo(this.model, 'tag:add tag:remove', this.renderTags);
      }

      // Bindings
      this.bindTo(this.model, 'edit', this.renderEditForm);
      this.bindTo(this.model, 'change:description', this.renderDescription);
      this.bindTo(this.model, 'change:status', this.renderStatusNotification);
    },

    render: function() {
      // Build up data object for use with view
      var self = this,
          data = this.packageModel();

      $(this.el).html(Mustache.to_html(TicketTmpl, data));

      // Render Meta Data in Details View
      if(this.renderAll) {
        this.renderMeta();
      }

      // Render Tags In List View
      if(!this.renderAll) {
        this.renderTags();
      }

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
      var view;

      view = this.createView(TicketMeta, {
        model: this.model
      });

      this.$el.append(view.render().el);
    },

    /**
     * Render the Tag icons in the List View
     */

    renderTags: function() {
      var i, len, tags,
          self = this;

      // Empty element
      $('.tags', this.el).empty();

      tags = ticketer.collections.lists.filter(function(tag) {
        return tag.hasTicket(self.model.id);
      });

      for(i = 0, len = tags.length; i < len; i++) {
        $('ul.tags', this.el).append(this.renderTag(tags[i]));
      }
    },

    /**
     * Render a Single Tag on List View
     */

    renderTag: function(tag) {
      var data = tag.toJSON();
      data.color = ticketer.colors[data.color].name;

      return Mustache.to_html(TagTmpl, data);
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
      data.user = this.model.get('user');
      data.datetime = this.model.get('closed_at') || this.model.get('opened_at');

      var momentObj = moment(new Date(data.datetime));
      data.cleanTime = momentObj.format('h:mm A');

      data.hoverTime = this.model.responseTime() || data.cleanTime;
      data.statusClass = this.model.get('assigned_to').length ? 'read' : 'unread';
      data.isClosed = this.model.get('status') === 'closed';

      data.showTags = true; // default

      if(this.renderAll) {
        data.description = marked(this.model.get('description'));
        data.fullDate = momentObj.format('MMMM Do, YYYY h:mm A');
        data.showTags = false;
        data.isEditable = this.isEditable(data);
        data.isAdmin = ticketer.currentUser.role === 'admin' ? true : false;
      }

      return data;
    },

    /**
     * Should this Ticket be editable?
     *
     * @return {Boolean}
     */

    isEditable: function(data) {
      if(data.user.id === ticketer.currentUser.id) {
        return true;
      }

      if(ticketer.currentUser.role === 'admin') {
        return true;
      }

      return false;
    },

    // Handle Actions
    ticketAction: function(e) {
      var action = $(e.currentTarget).data('action'),
          request = "Delete this ticket? This cannot be undone";

      switch(action) {
        case 'close':
          this.model.close();
          break;
        case 'edit':
          this.model.trigger('edit');
          break;
        case 'delete':
          var resp = confirm(request);
          if(resp) this.model.destroy();
          break;
      }

      e.preventDefault();
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
        error: self.triggerViewError
      });
    },

    /**
     * Re-render the description when it has been updated.
     * Only replace the content if the model is in the
     * details view. Controlled by the RenderAll flag.
     */

    renderDescription: function() {
      if(!this.renderAll) return false;

      var html = marked(this.model.get('description'));
      $('.content', this.el).html(html);
    },

    /**
     * Show a Notification if a ticket's status changes when viewing it.
     * Only display if the model is in the details view.
     * Controlled by the RenderAll flag.
     */

    renderStatusNotification: function() {
      if(!this.renderAll) return false;

      $('.content', this.el).before(Mustache.to_html(NotifyTmpl));

      // Remove close button if currentUser is an Admin
      if(ticketer.currentUser.role === 'admin') {
        $('.edit-options li[data-role="close-ticket"]').remove();
      }
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
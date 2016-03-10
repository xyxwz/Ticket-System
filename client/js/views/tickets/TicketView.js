/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'mustache', 'BaseView',
  'views/tickets/TicketMetaView',
  'views/dialogs/CopyTicketPath',
  'text!templates/tickets/Ticket.html',
  'text!templates/tickets/AssignedUser.html',
  'text!templates/tickets/EditTicket.html',
  'text!templates/tickets/EditTicketTitle.html',
  'text!templates/tickets/ClosedNotification.html',
  'text!templates/tickets/AssignedTag.html',
  'moment', 'marked'],
function($, _, mustache, BaseView, TicketMeta, CopyTicketPath, TicketTmpl, UserTmpl, EditTmpl, EditTitleTmpl, NotifyTmpl, TagTmpl) {

  /**
   * TicketView
   * render a single Ticket
   *
   * @param {Backbone.Model} model
   * @param {Boolean} renderAll
   */

  var TicketView = BaseView.extend({
    className: 'ticket',

    attributes: function() {
      return {
        'data-id': this.model.id
      };
    },

    events: {
      "click a[data-action]": "ticketAction",
      "click [data-action='save']": "saveTicket",
      "click [data-action='cancel']": "renderDescription",
      "click [data-role='display-ticket-path']": "displayPath",
      "click .md a": "openLink",
      "drop": "onDrop",
      "dragover": "nullEvent",
      "dragenter": "nullEvent",
      "dragleave": "nullEvent"
    },

    initialize: function() {
      // Render all data for the ticket
      this.renderAll = this.options.renderAll || false;

      // Bind to List Collection Reset
      // Handles page refreshes where list may render before
      // the collection reset event
      if(!this.renderAll) {
        this.bindTo(this.model, 'tag:add tag:remove', this.renderTags, this);
        this.bindTo(ticketer.collections.lists, 'reset', this.renderTags, this);
      } else {
        this.bindTo(this.model, 'edit', this.renderEditForm, this);
      }

      // Bindings
      this.bindTo(this.model, 'change:read change:assigned_to', this.render, this);
      this.bindTo(this.model, 'change:title', this.renderDescription, this);
      this.bindTo(this.model, 'change:description', this.renderDescription, this);
      this.bindTo(this.model, 'change:status', this.renderStatusNotification, this);
      this.bindTo(this.model, 'change:notification', this.renderStatusMarker, this);
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
      var momentDate,
          data = {},
          desc = this.model.get('description');

      // Set default attributes to render
      data.showTags = true;
      data.isClosed = !this.model.isOpen();
      data.user = this.model.get('user');
      data.title = this.model.get('title');
      data.datetime = this.model.get('closed_at') || this.model.get('opened_at');

      momentDate = moment(new Date(data.datetime));

      if(momentDate.calendar().match(/(Today|Yesterday)/g)) {
        data.cleanTime = RegExp.$1; // Today || Yesterday
      } else {
        if(momentDate.year() < moment().year()) {
          data.cleanTime = momentDate.format('MMM YYYY');
        } else {
          data.cleanTime = momentDate.format('MMM D');
        }
      }

      data.hoverTime = this.model.responseTime() || data.cleanTime;

      if(this.model.notification()) {
        data.statusClass = 'notify';
      } else {
        data.statusClass = !this.model.get('read') ? 'unread' :
                            (this.model.isOpen() ? 'read' : 'closed');
      }

      if(window.aprilFool)
        data.statusClass = 'unread';

      if(this.renderAll) {
        data.description = marked(desc);
        data.showTags = false;
        data.isEditable = this.isEditable(data);
        data.fullDate = momentDate.format('MMMM Do, YYYY h:mm A');
        data.isAssignable = ticketer.currentUser.isAdmin() && !this.model.isAssigned();
        data.isClosable = !!~this.model.get('assigned_to')
          .indexOf(ticketer.currentUser.id) && !data.isClosed;
      } else {
        // Take the first 200 characters of description
        desc = desc.slice(0, desc.length < 200 ? desc.length : 200);
        data.description = "<p>" + desc.replace(/[^A-Za-z0-9\\\/:,\.\?"'\s]/g, "") + "</p>";
      }

      return data;
    },

    /**
     * Should this Ticket be editable?
     *
     * @return {Boolean}
     */

    isEditable: function(data) {
      return (data.user.id === ticketer.currentUser.id ||
              ticketer.currentUser.isAdmin()) && !data.isClosed;
    },

    // Handle Actions
    ticketAction: function(e) {
      var resp,
          action = $(e.currentTarget).data('action'),
          delMsg = "Delete this ticket? This cannot be undone",
          closeMsg = "Close this ticket? This cannot be undone",
          assignMsg = "Take responsibility for this ticket? This cannot be undone";

      switch(action) {
        case 'assign':
          resp = confirm(assignMsg);
          if(resp) this.model.assignUser(ticketer.currentUser.id);
          break;
        case 'close':
          resp = confirm(closeMsg);
          if(resp) this.model.close();
          break;
        case 'edit':
          this.model.trigger('edit');
          break;
        case 'delete':
          resp = confirm(delMsg);
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

        $('hgroup', this.$el).html(Mustache.to_html(EditTitleTmpl, {
          title: this.model.get('title')
        }));

        $('textarea', this.$el).autoResize({
          minHeight: 150,
          extraSpace: 14
        });
      }
    },

    /**
     * determine if a ticket is being edited
     */

    isEditing: function() {
      return $('.ticket .ticket-form', this.$el).length;
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
          title = $('.ticket-form > input', self.el).val(),
          description = $('.wrap > textarea', self.el).val();

      $('textarea', this.el).data('AutoResizer').destroy();

      self.model.save({
        title: title,
        description: description}, {
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
      this.render();
    },

    /**
     * Show a Notification if a ticket's status changes when viewing it.
     * Only display if the model is in the details view.
     * Controlled by the RenderAll flag.
     */

    renderStatusNotification: function() {
      if(!this.renderAll) return false;

      this.$('.content').before(Mustache.to_html(NotifyTmpl));

      // Remove close button if currentUser is an Admin
      if(ticketer.currentUser.isAdmin()) {
        $('.edit-options li[data-role="close-ticket"]').remove();
      }
    },

    /**
     * Add the `{{statusClass}}` to the ticket header
     * bound to `change:notification` and `change:assigned_to`
     */

    renderStatusMarker: function() {
      var element = this.$('.ticket-content');

      if(this.model.notification()) {
        element.removeClass('unread read').addClass('notify');
      } else if(this.model.get('read')) {
        element.removeClass('unread notify').addClass('read');
      } else {
        element.removeClass('read notify').addClass('unread');
      }

      if(aprilFool) {
        console.log('fools');
        element.removeClass('unread read notify').addClass('unread');
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
    },

    /**
     * Used to enable drop events.
     * - Bound to dragenter, dragover, dragleave
     *
     * @param {jQuery.Event} e
     */

    nullEvent: function(e) {
      e.preventDefault();
      e.stopPropagation();
    },

    /**
     * Handle list drop event
     *
     * @param {jQuery.Event} e
     */

    onDrop: function(e) {
      var list,
          data = e.originalEvent.dataTransfer,
          id = data ? data.getData('text') : '';

      if(id) {
        list = ticketer.collections.lists.get(id);

        if(list) {
          list.addTicket(this.model.id);
          this.model.trigger('tag:add');
        }
      }
    },

    /**
     * Display modal with ticket items path
     *
     * @param {jQuery.Event} e
     */

    displayPath: function(e) {
      e.preventDefault();
      e.stopPropagation();

      // Change displayed path based on host OS
      var basepath,
          OS = navigator.appVersion;
          sub = this.model.isOpen() ? 'Open/' : 'Closed/';

      if(OS.indexOf("Win") != -1) {
        basepath = 'S:' + this.model.get('ticketsPath') + sub;
        basepath = basepath.replace(/\//g, '\\');
      } else if(OS.indexOf("Mac") != -1) {
        basepath = '/Volumes/SHARED' + this.model.get('ticketsPath') + sub;
      } else {
        basepath = 'smb://txssc-fileserv2.tssc.txstate.edu/SHARED' +
          this.model.get('ticketsPath') + sub;
      }

      new CopyTicketPath().setPath(basepath + this.model.get('id'));
    }

  });

  return TicketView;
});

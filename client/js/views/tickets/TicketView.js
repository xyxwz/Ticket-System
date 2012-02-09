/* TicketView
 * Renders a single Ticket
 */

define(['jquery', 'underscore', 'backbone', 'BaseView', 'mustache',
'text!templates/tickets/Ticket.html', 'text!templates/tickets/Timestamp.html',
'text!templates/tickets/AssignedUser.html', "text!templates/tickets/AdminPopupOptions.html",
'text!templates/tickets/EditTicket.html', 'timeago', 'jqueryui/droppable', 'marked'],
function($, _, Backbone, BaseView, mustache, TicketTmpl, TimestampTmpl, AssignedUserTmpl, AdminPopupTmpl, EditTmpl) {

  var TicketView = BaseView.extend({
    tagName: 'div',
    className: 'row ticket',

    events: {
      "click #closeTicket": "closeTicket",
      "click .popupChoices li.remove": "deleteTicket",
      "click .popupChoices li.edit": "editTicket",
      "click #saveTicket": "saveTicket",
      "click #cancelEdit": "renderEdit"
    },

    initialize: function() {
      _.bindAll(this);
      this.admin = this.options.admin;

      $(this.el).attr('id', 'id_'+ this.model.id);

      // Determines wheter or not to show notifications
      this.notify = this.options.notify;

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
      this.bindTo(this.model, 'assignedUser', this.addAssignee);
    },

    render: function() {
      // Build up data object for use with view
      var self = this,
          data = this.model.toJSON();

      data.description = marked(data.description);
      data.comments = this.model.comments.length;
      data.showAdmin = this.renderAdminOptions(); // True or False
      data.user = this.model.get('user');
      data.user.shortname = data.user.name.split(' ')[0];

      // Set Tack CSS class
      if(data.status === 'closed') {
        data.tackClass = 'closed';
      }
      else {
        data.tackClass = data.assigned_to.length > 0 ? 'read' : 'unread';
      }

      data.notify = this.model.notification() && this.notify ? 'notify' : null;
      $(this.el).html(Mustache.to_html(TicketTmpl, data));

      this.setTimestamp();
      this.setAssignedUsers();

      /* Make the entire ticket a droppable element that accepts
       * .assign classes within the assigned_to scope.
       *
       * User to assign users to a ticket's assigned_users param.
       */
      $(this.el).droppable({
        accept: '.assign',
        scope: 'assigned_to',
        drop: function(e, ui) {
          self.model.assignUser(ui.draggable.attr('id'));
        }
      });

      // Check Abilities to add edit/delete functionality
      this.checkAbilities(data);

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

    /* Check whether or not to display edit/remove options.
     * The ticket must belong to the current user or the
     * current user must have the role admin. If so append the
     * edit button and setup click bindings.
     *
     * :data - the current model in JSON form
     */
    checkAbilities: function(data) {
      if(this.admin && (data.user.id === currentUser.id || currentUser.role === 'admin')) {
        var html = "<li class='gears'></li>";
        $('ul.ticketMeta', this.el).append(html);

        // If currentUser is owner but not an admin go directly to
        // edit mode on click
        if(data.user.id === currentUser.id && currentUser.role != 'admin') {
          this.bindTo($('ul.ticketMeta li.gears', this.el), 'click', this.editTicket);
        }
        else {
          $('ul.ticketMeta li.gears', this.el).append(AdminPopupTmpl);
          this.bindTo($('ul.ticketMeta li.gears', this.el), 'click', this.showEditOptions);
        }
      }
    },

    // Display a pop-up with multiple actions to choose from
    showEditOptions: function() {
      $('ul.ticketMeta li.gears ul', this.el).show();
      this.bindTo($('ul.ticketMeta li.gears', this.el), 'clickoutside', this.hideEditOptions);
    },

    // Hide the popup
    hideEditOptions: function() {
       $('ul.ticketMeta li.gears ul', this.el).fadeOut(200);
    },

    /* Edit/Delete functionality
     */

    deleteTicket: function() {
      var resp;

      resp = confirm("Are you sure you want to delete this ticket? It can not be undone");
      if (resp === true) {
        this.model.destroy();
      }
    },

    /* Renders the timestamp with the jQuery timeago plugin
     * auto updates */
    setTimestamp: function() {
      var timestamp;

      if (this.model.get('closed_at')) {
        $('.timestamp', this.el).remove();
        timestamp = { time: this.model.get('closed_at') };
        $('.ticketName', this.el).append(Mustache.to_html(TimestampTmpl, timestamp));
        $('.timestamp', this.el).prepend('closed: ');
        $('time.timeago', this.el).timeago();
      }
      else {
        timestamp = { time: this.model.get('opened_at') };
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

      // Unbind drag and drop
      $(this.el).droppable('destroy');
      $('.ticketHeader ul', this.el).off();
      $('.ticketHeader ul li', this.el).each(function(){
        $(this).draggable('destroy');
      });

    },

    /* Runs on model 'change' event and updates view elements */
    updateTicket: function(model) {
      var changedAttributes = this.model.changedAttributes();

      if(changedAttributes.status) {
        $('#ticketOptions', this.el).fadeOut(100);
        $('.ticketHeader .tack', this.el).removeClass('unread read').addClass('closed');
      }

      if(changedAttributes.closed_at) {
        this.setTimestamp();
      }

      if(changedAttributes.title) {
        $('.ticketName h2', this.el).html(changedAttributes.title);
      }

      if(changedAttributes.description) {
        $('.ticketBody', this.el).html(marked(changedAttributes.description));
      }

      if(changedAttributes.assigned_to) {
        $('.ticketHeader ul', this.el).html('');
        this.setAssignedUsers();
      }

      if(changedAttributes.notification && this.notify) {
        $('.ticketHeader', this.el).addClass('notify');
      }

    },

    /* Renders the ticket's assigned users avatars */
    setAssignedUsers: function() {
      var self = this,
          assigned_to = this.model.get('assigned_to');

      if(assigned_to.length > 0) {
        $('.ticketHeader .tack', this.el).removeClass('unread').addClass('read');
      }
      else {
        $('.ticketHeader .tack', this.el).removeClass('read').addClass('unread');
      }

      _.each(assigned_to, function(id) {
        var user = ticketer.collections.admins.get(id),
            html = Mustache.to_html(AssignedUserTmpl, user.toJSON());

        $('.ticketHeader ul', self.el).prepend(html);
      });

      /* Bind assigned users to .draggable using the mouseover
       * event. Check if element is already a draggable first.
       *
       * Used to make avatars draggable for use in removeAssignedTo.
       */
      if(ticketer.currentUser.role === "admin") {

        $('.ticketHeader ul', this.el).on('mouseenter', 'li', function() {
          if(!$(this).is(':data(draggable)')) {
            $(this).draggable({
              distance: 30,
              cursorAt: {
                top: 21,
                left: 21
              }
            });

            $('.ticketHeader ul li', self.el).bind("drag", self.dragAvatar);
            $('.ticketHeader ul li', self.el).bind("dragstop", self.dragAvatarStop);
          }
        });
      }

    },

    /* Adds a single assignee to ticket's assigned users avatars list
     *    :id - an id from a tickets assigned_users array
     */
    addAssignee: function(id) {
      var self = this,
          newAssignees = _.difference(
            this.model.changedAttributes().assigned_to,
            this.assigned_to
          );

      // Add newly assigned user to this.assigned_to
      _.each(newAssignees, function(user) {
        self.assigned_to.push(user);

        var userObj = ticketer.collections.admins.get(user),
            html = Mustache.to_html(AssignedUserTmpl, userObj.toJSON());

        $('.ticketHeader ul', self.el).prepend(html);
      });

      $('.ticketHeader .tack', this.el).removeClass('unread').addClass('read');
    },

    /* Removes a single assignee from a ticket's assigned users avatars list.
     *    :id = an id from a tickets assigned_ussers array
     */
    removeAssignee: function(id) {
      var newArray = _.reject(this.assigned_to, function(user) {
        return user === id;
      });
      this.assigned_to = newArray;
      this.model.unassignUser(id);

      if(newArray.length === 0) {
        $('.ticketHeader .tack', this.el).removeClass('read').addClass('unread');
      }
    },

    /* Drag Avatar */
    dragAvatar: function(e, ui) {
      var html = ui.helper;
      if(ui.position.top < -45) {
        $(html).data('draggable').options.revert = false;
        if($('span figure', html).length === 0) {
          $('span', html).append("<figure class='poof'></figure>");
        }
      }
      else {
        $(html).data('draggable').options.revert = true;
        $('figure', html).remove();
      }
    },

    /* Stop Dragging Avatar */
    dragAvatarStop: function(e, ui) {
      var html = ui.helper;
      if(ui.position.top < -45) {
        var id = $('span', html).data('user');
        $(html).remove();
        this.removeAssignee(id);
      }
      else {
        $('figure', html).remove();
      }
    },

    /* open the ticket for editing */
    editTicket: function() {
      var self = this;

      if($('.ticketBody > .ticketEdit', self.el).length === 0) {
        $('ul.ticketMeta li.gears ul', this.el).hide();

        $('.ticketBody').html(Mustache.to_html(EditTmpl, { description: self.model.get('description') }));

        $('textarea', this.el).autoResize({
          minHeight: 150,
          extraSpace: 14
        });
      }
    },

    saveTicket: function(e) {
      e.preventDefault();

      var self = this,
          description = $('.outerWrap > textarea', self.el).val();

      $('textarea', this.el).data('AutoResizer').destroy();

      self.model.save({ description: description }, {error: self.triggerViewError, success: self.renderEdit});
    },

    renderEdit: function(e) {
      /* just so we don't have to create another function */
      if(e instanceof jQuery.Event) {
        e.preventDefault();
      }

      var self = this;

      $(this.el).fadeOut(200, function() {
        self.render();
        $(self.el).fadeIn(200);
      });
    }

  });

  return TicketView;
});
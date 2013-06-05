/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'backbone',
  'BaseView', 'mustache',
  'collections/PollingCollection',
  'views/widgets/TagListWidgetView',
  'views/widgets/UserFilterWidgetView',
  'text!templates/toolbars/Toolbar.html'],
function($, _, Backbone, BaseView, mustache,
          PollingCollection, TaskList, UserFilter, tmpl_Toolbar) {

  /**
   * Toolbar view
   * assists in changing main views
   */

  var ToolbarView = BaseView.extend({
    className: 'sidebar',
    events: {
      'click a[data-route]': 'navigateTo'
    },

    initialize: function() {
      var events = [
        'ticket:new',
        'ticket:update',
        'ticket:remove',
        'comment:new',
        'collection:reset'].join(' ');

      this.unread = new PollingCollection(null, {
        url: '/api/unread'
      });

      this.notifications = new PollingCollection(null, {
        url: '/api/notifications'
      });

      this.bindTo(ticketer.EventEmitter, events, this.fetch, this);
      this.bindTo(this.unread, 'sync', this.renderCounts, this);
      this.bindTo(this.notifications, 'sync', this.renderCounts, this);
      this.bindTo(ticketer.EventEmitter,
                    'notification:remove', this.destroyNotification, this);
    },

    /**
     * Call fetch on `this.unread` and `this.notifications`
     */

    fetch: function() {
      this.unread.fetch();
      this.notifications.fetch();
    },

    /**
     * Destroy the notification with `id` and call `this.renderCounts`
     * on success
     */

    destroyNotification: function(id) {
      var model = this.notifications.get(id);

      if(model) {
        model.destroy({
          success: this.renderCounts.bind(this)
        });
      }
    },

    render: function() {
      this.$el.html(Mustache.to_html(tmpl_Toolbar));
      this.renderCounts();
      this.renderTagWidget();
      this.renderUserFilterWidget();

      return this;
    },

    renderCounts: function() {
      var open = this.unread.length,
          mine = this.notifications.length;

      if(mine === 0) {
        this.$('[data-role="my-count"]').hide();
      } else {
        this.$('[data-role="my-count"]').text(mine).show();
      }

      if(open === 0) {
        this.$('[data-role="open-count"]').hide();
      } else {
        this.$('[data-role="open-count"]').text(open).show();
      }
    },

    renderTagWidget: function() {
      var view = this.createView(TaskList, {
        collection: ticketer.collections.lists
      });

      this.$el.append(view.render().el);
    },

    renderUserFilterWidget: function() {
      var view = this.createView(UserFilter, {
        collection: ticketer.collections.users
      });

      this.$el.append(view.render().el);
    },

    /**
     * Navigate to the clicked element's
     * data-route attribute
     */

    navigateTo: function(e) {
      e.preventDefault();

      var target = $(e.target);

      if(!target.parent().hasClass('.active')) {
        ticketer.routers.ticketer.navigate(target.data('route'), true);
      }
    },

    selectTab: function(tab) {
      this.$el.find('.group > .active').removeClass('active');

      if(tab) {
        this.$el.find('a[data-route="' + tab + '"]').parent().addClass('active');
      }

      return this;
    }

  });

  return ToolbarView;
});
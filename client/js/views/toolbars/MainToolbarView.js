/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'backbone',
  'BaseView', 'mustache',
  'views/widgets/TagListWidgetView',
  'text!templates/toolbars/Toolbar.html'],
function($, _, Backbone, BaseView, mustache, TaskList, tmpl_Toolbar) {

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
      var events = 'ticket:new ticket:update comment:new';

      this.unread = ticketer.counts.unread || [];
      this.notifications = ticketer.counts.notifications || [];

      ticketer.EventEmitter.on(events, this.calculateCounts, this);
    },

    render: function() {
      this.$el.html(Mustache.to_html(tmpl_Toolbar));
      this.renderCounts();
      this.renderTagWidget();

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

    calculateCounts: function(data) {
      var idx;

      if(typeof data.ticket === 'undefined') {
        idx = ~this.unread.indexOf(data.id);

        if(data.assigned_to.length && idx) {
          this.unread.slice(idx, 1);
        } else if(!data.assigned_to.length && !idx) {
          this.unread.push(data.id);
        }

        this.renderCounts();
      } else {
        idx = ~this.notifications.indexOf(data.ticket);

        if(data.notification) {
          if(!idx) {
            this.notifications.push(data.ticket);
          }
        } else {
          if(idx) {
            this.notifications.slice(idx, 1);
          }
        }

        this.renderCounts();
      }
    },

    /**
     * Navigate to the clicked element's
     * data-route attribute
     */

    navigateTo: function(e) {
      e.preventDefault();

      var target = $(e.target).data('route');

      this.selectTab(target);
      ticketer.routers.ticketer.navigate(target, true);
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
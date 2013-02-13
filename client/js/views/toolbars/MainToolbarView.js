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
      _.bindAll(this);

      // This is a very heavy event binding...
      this.bindTo(ticketer.collections.openTickets, 'add remove reset change', this.renderCounts);
    },

    render: function() {
      this.$el.html(Mustache.to_html(tmpl_Toolbar));
      this.renderCounts();
      this.renderTagWidget();

      return this;
    },

    renderCounts: function() {
      var mine = ticketer.collections.openTickets.filter(function(ticket) {
        return ticket.participating() && ticket.notification();
      }).length;

      var open = ticketer.collections.openTickets.filter(function(ticket) {
        return !ticket.get('assigned_to').length;
      }).length;

      if(mine === 0) {
        $('[data-role="my-count"]', this.el).hide();
      } else {
        $('[data-role="my-count"]', this.el).text(mine).show();
      }

      if(open === 0) {
        $('[data-role="open-count"]', this.el).hide();
      } else {
        $('[data-role="open-count"]', this.el).text(open).show();
      }
    },

    renderTagWidget: function() {
      var view = this.createView(TaskList, {
        collection: ticketer.collections.lists
      });

      this.$el.append(view.render().el);
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
/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'mustache', 'BaseView',
  'views/headers/BasicHeaderView',
  'views/toolbars/TicketToolbarView',
  'views/tickets/TicketDetailsView'],
function($, _, mustache, BaseView, HeaderView,
  ToolbarView, DetailsView) {

  /**
   * The main ticket details view
   */

  var TicketDetailsView = BaseView.extend({
    className: "container",

    initialize: function() {
      _.bindAll(this);
    },

    render: function() {
      var header, sidebar, primary;

      header = this.createView(HeaderView, {
        title: 'Ticket Details',
        route: 'tickets/new'
      });

      sidebar = this.createView(ToolbarView, {
        model: this.model
      });

      primary = this.createView(DetailsView, {
        model: this.model
      });

      this.$el.html(header.render().el);
      this.$el.append(sidebar.render().el);
      this.$el.append(primary.render().el);

      return this;
    }
  });

  return TicketDetailsView;
});
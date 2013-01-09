/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'mustache', 'BaseView',
  'views/headers/BasicHeaderView',
  'views/tickets/TicketFormView'],
function($, _, mustache, BaseView, HeaderView, FormView) {

  /**
   * The main view for ticket creation
   */

  var TicketListView = BaseView.extend({
    className: "container",

    initialize: function() {
      _.bindAll(this);
    },

    render: function() {
      var header, primary;

      header = this.createView(HeaderView, {
        title: 'Create Ticket',
        route: 'tickets/new'
      });

      primary = this.createView(FormView, this.options);

      this.$el.empty();
      this.$el.append(header.render().el);
      this.$el.append(primary.render().el);

      return this;
    }
  });

  return TicketListView;
});
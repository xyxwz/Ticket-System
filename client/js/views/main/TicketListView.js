/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'mustache', 'BaseView',
  'views/headers/BasicHeaderView',
  'views/tickets/TicketListView'],
function($, _, mustache, BaseView, HeaderView, ListView) {

  /**
   * The main view for ticket lists
   *
   * @param {String} title
   */

  var TicketListView = BaseView.extend({
    className: "container",

    initialize: function() {
      _.bindAll(this);
    },

    render: function() {
      var header, primary;

      header = this.createView(HeaderView, {
        title: this.options.title,
        route: 'tickets/new'
      });

      primary = this.createView(ListView, this.options);

      this.$el.empty();
      this.$el.append(header.render().el);
      this.$el.append(primary.render().el);

      return this;
    }
  });

  return TicketListView;
});
/**
 * The main view for ticket lists
 */

define(['jquery', 'underscore', 'mustache', 'BaseView',
  'views/headers/BasicHeaderView',
  'views/tickets/TicketListView'],
function($, _, mustache, BaseView, HeaderView, ListView) {

  var TicketListView = BaseView.extend({
    className: "container",

    initialize: function() {
      _.bindAll(this);
    },

    render: function() {
      var header, primary, title;

      if(this.options.status === 'closed') {
        title = 'Closed Tickets';
      }
      else {
        title = 'Open Tickets';
      }

      header = this.createView(HeaderView, {
        title: title,
        route: 'tickets/new'
      });

      primary = this.createView(ListView, {
        collection: this.collection,
        status: this.status
      });

      this.$el.append(header.render().el);
      this.$el.append(primary.render().el);

      return this;
    }
  });

  return TicketListView;
});
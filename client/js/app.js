var ticketer = ticketer || {};

(function() {

  "use strict";

  ticketer.Comment = Backbone.Model.extend({});

  ticketer.Ticket = Backbone.Model.extend({
    url: '/tickets.json',

    defaults: {
      'status'    : 'Open',
    },

    initialize: function() {
      this.comments = new ticketer.Comments();
      this.comments.url = '/tickets/' + this.id + '/comments.json';
      var op = this;
      this.bind("change", function() {
        op.comments.url = '/tickets/' + this.id + '/comments.json';
      });
    },
    close: function() {
      this.set({ status: 'Closed' });
    },
  });

  
  ticketer.User = Backbone.Model.extend({
    url: '/users.json',
  });


  //collections
  ticketer.Comments = Backbone.Collection.extend({
    model: ticketer.Comment,
  });


  ticketer.Tickets = Backbone.Collection.extend({
    model: ticketer.Ticket,
    url: '/tickets.json',

    initialize: function() {
      var op = this;
      this.bind("reset", function() {
        op.each(function(ticket) {
          ticket.comments.fetch();
        });
      });
    }
  }); 

}).call(this);

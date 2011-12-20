/*
 * ticketer - our namespace object, create 
 * the object and attach functions and models to
 * it */
var ticketer = ticketer || {};

(function() {

  /* 
   * Comment model - used to represent a single
   * comment */
  ticketer.Comment = Backbone.Model.extend({});


  /* 
   * Ticket model - used to represent a single ticket object.
   *  - comments child, tickets have multiple comments */
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


  /*
   * User model - used to get the current user and store that 
   * information in memory. */
  ticketer.User = Backbone.Model.extend({
    url: '/users.json',
  });


  /*
   * Comment collection - used to represent a collection
   * of comments on a single ticket model */
  ticketer.Comments = Backbone.Collection.extend({
    model: ticketer.Comment,
  });


  /*
   * Ticket collection - used to represent a collection of
   * tickets */
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


  /*
   * User collection - used to represent all users */
  ticketer.Users = Backbone.Collection.extend({
    model: ticketer.User,

    initialize: function() {

    },
  });


}).call(this);

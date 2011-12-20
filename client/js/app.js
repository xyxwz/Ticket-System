/*
 * ticketer - our namespace object, create 
 * the object and attach functions and models to
 * it */
var ticketer = ticketer || {};

(function() {

  /*
   * Override the Backbone sync functionality -
   * all calls to Backbone.sync now send an auth_token
   * header. */
  Backbone.sync_model = Backbone.sync;
  Backbone.sync = function(method, model, options) {

    var new_options = _.extend({

      beforeSend: function(xhr) {

        //Get the authentication token from the page
        var auth_token = $('meta[name="auth_token"]').attr('value');
        if (auth_token) {
          xhr.setRequestHeader('auth_token', auth_token);
        }
      }
    }, options);

    Backbone.sync_model(method, model, new_options);

  };


  /* 
   * Comment model - used to represent a single
   * comment */
  ticketer.Comment = Backbone.Model.extend({

    initialize: function() {

    },

    updateComment: function(comment, callback) {

      if (comment) {
        this.set({ comment: comment });
      }
      this.save(null, { error: callback });

    },
  
  });


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

    updateTicket: function(ticket, callback) {

      if (ticket.title) {
        this.set({ title: ticket.title });
      }
      if (ticket.description) {
        this.set({ description: ticket.description });
      }
      if (ticket.status) {
        this.set({ status: ticket.status });
      }

      this.save(null, { error: callback });

    },

    close: function(callback) {

      this.set({ status: 'Closed' });
      this.save(null, { error: callback });

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

    removeComments: function(callback) {

      var op = this;
      this.each(function(comment) {

        comment.destroy({ error: callback });

      });
    }

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

    },

  });


  /*
   * User collection - used to represent all users */
  ticketer.Users = Backbone.Collection.extend({

    model: ticketer.User,

    initialize: function() {

    },

  });


}).call(this);

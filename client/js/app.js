var app = new Object;

(function(){
  
  app.Comment = Backbone.Model.extend({});

  
  app.Ticket = Backbone.Model.extend({
    url: '/tickets.json',

    initialize: function() {
      this.comments = new app.Comments();
      this.comments.url = '/tickets/' + this.id + '/comments.json';

      var op = this;
      this.bind("change", function() {
        op.comments.url = '/tickets/' + this.id + '/comments.json';
      });
    },
  });

  
  app.User = Backbone.Model.extend({
    url: '/users.json',
  });


  //collections
  app.Comments = Backbone.Collection.extend({
    model: app.Comment,
    });


  app.Tickets = Backbone.Collection.extend({
    model: app.Ticket,
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

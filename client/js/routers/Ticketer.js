// Main Router

define(['jquery', 'backbone'], function($, Backbone) {

  var Ticketer = Backbone.Router.extend({

    routes: {
      "": "index",  
    },

    // Paths
    index: function() {
      ticketer.views.headers.full.render();
    },


  });

  return Ticketer;
});
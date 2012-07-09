define(['underscore', 'backbone', 'models/List'],

function(_, Backbone, List) {
  var Lists;

  Lists = Backbone.Collection.extend({
    model: List,
    url: '/api/lists',

    initialize: function() {
      _.bindAll(this);
    },

    getListTickets: function(model) {
      var list = this.get(model.id);

      return list.get('tickets');
    }

  });


  return Lists;
});
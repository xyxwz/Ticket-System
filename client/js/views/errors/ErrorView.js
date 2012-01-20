define(['jquery', 'underscore', 'backbone', 'BaseView', 'mustache',
'text!templates/errors/Error.html'],

function($, _, Backbone, BaseView, mustache, ErrorTmpl) {

  var ErrorView = BaseView.extend({

    tagName: "div",
    className: "alert-message error",

    events: {
      "click .close" : "closeError",
    },

    initialize: function() {
      _.bindAll(this);
      this.message = this.options.message;
    },

    render: function() {

      $(this.el).html(Mustache.to_html(ErrorTmpl, { error: this.message }));
      return this;
    },

    closeError: function(e) {
      e.preventDefault();

      var self = this;

      $(this.el).slideUp(400, 'swing', function() {
        self.remove();
      });
    },

  });

  return ErrorView;
});
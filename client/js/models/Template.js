/* Template model - used to represent a single template object.
 *  - used to create a ticket with predefined text */

define(['underscore', 'backbone'], function(_, Backbone) {
  var Template = Backbone.Model.extend({
    urlRoot: '/api/templates',

    initialize: function() {
      this.on('invalid', function() {
        ticketer.EventEmitter.trigger('error', "Error saving template");
      });
    },

    /* Validate the model to ensure that the title and body have content */
    validate: function(attrs) {
      if(typeof(attrs.title) !== 'undefined' && !attrs.title.replace(/ /g, '').length) {
        return "You must enter a template title.";
      }
      if(typeof(attrs.description) !== 'undefined' && !attrs.description.replace(/ /g, '').length) {
        return "You must enter a template description.";
      }
    }

  });

  return Template;
});

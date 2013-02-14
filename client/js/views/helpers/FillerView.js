/**
 * View Dependencies
 */

define([
  'jquery',
  'underscore',
  'BaseView'
],
function($, _, BaseView) {

  /**
   * A simple view for rendering a filler view
   */

  var FillerView = BaseView.extend({
    className: "view-filler",

    initialize: function() {
      _.bindAll(this);
    },

    render: function() {
      this.$el.html("<p>Select an item to view it's details.</p>");
      return this;
    }
  });

  return FillerView;
});
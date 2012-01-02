/* BackHeaderView
 * Renders a header with delegated events
 */

define(['jquery', 'underscore', 'backbone','text!templates/headers/Back.html'],
function($, _, Backbone, HeaderTmpl) {

  var BackHeadersView = Backbone.View.extend({

    events: {
      "click a": "navigateBack",
    },

    initialize: function() {
      _.bindAll(this);
    },

    render: function() {
      $(this.el).html(HeaderTmpl);
      return this;
    },

    navigateBack: function(e) {
      e.preventDefault();
      window.history.back();
    },

  });

  return BackHeadersView;
 });
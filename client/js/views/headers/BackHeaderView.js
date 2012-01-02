/* BackHeaderView
 * Renders a header with delegated events
 */

define(['jquery', 'underscore', 'backbone', 'garbage', 'text!templates/headers/Back.html'],
function($, _, Backbone, BaseView, HeaderTmpl) {

  var BackHeadersView = BaseView.extend({

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
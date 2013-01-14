/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'mustache', 'BaseView'],
function($, _, mustache, BaseView) {

  /**
   * The main view for ticket lists
   *
   * @param {String} title
   */

  var ListPanelView = BaseView.extend({
    className: "panelTwo",

    initialize: function() {
      _.bindAll(this);
    },

    render: function() {
      var self = this,
          view;

      view = this.createView(this.options.view, {
        collection: self.collection
      });

      this.$el.html(view.render().el);

      return this;
    }
  });

  return ListPanelView;
});
/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'mustache', 'BaseView',
  'text!templates/main/Filler.html'],
function($, _, mustache, BaseView, tmpl_Filler) {

  /**
   * The main view for details panel
   *
   * @param {Backbone.Model}
   */

  var DetailsPanelView = BaseView.extend({
    className: "panel-three",

    initialize: function() {
      _.bindAll(this);
    },

    render: function() {
      return this.model ?
        this.renderDetailsView() : this.renderFiller();
    },

    renderFiller: function() {
      this.$el.html(Mustache.to_html(tmpl_Filler, {
        text: "Select an item to view it's details."
      }));

      return this;
    },

    renderDetailsView: function() {
      var view = this.createView(this.options.view, {
        model: this.model
      });

      this.bindTo(this.model, 'remove', this.renderFiller);
      this.$el.html(view.render().el);

      return this;
    }
  });

  return DetailsPanelView;
});
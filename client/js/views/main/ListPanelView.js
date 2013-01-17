/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'mustache', 'BaseView',
  'text!templates/main/Filler.html'],
function($, _, mustache, BaseView, tmpl_Filler) {

  /**
   * The main view for panel two
   *
   * @param {Backbone.Collection} collection
   */

  var ListPanelView = BaseView.extend({
    className: "panel-two",

    initialize: function() {
      _.bindAll(this);

      this.bindTo(this.collection, 'add remove reset', this.render);
    },

    render: function() {
      return this.collection.length ?
        this.renderView() : this.renderFiller();
    },

    renderFiller: function() {
      this.$el.html(Mustache.to_html(tmpl_Filler, {
        text: "No items to display"
      }));

      return this;
    },

    renderView: function() {
      var view = this.createView(this.options.view, {
        collection: this.collection
      });

      this.$el.html(view.render().el);

      return this;
    }
  });

  return ListPanelView;
});
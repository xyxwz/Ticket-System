/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'mustache', 'BaseView',
  'text!templates/main/empty-details.html'],
function($, _, mustache, BaseView, tmpl_empty) {

  /**
   * The main view for ticket lists
   *
   * @param {String} title
   */

  var DetailsPanelView = BaseView.extend({
    className: "panelThree",

    initialize: function() {
      _.bindAll(this);
    },

    render: function() {
      var view,
          data;

      if(this.model) {
        view = this.createView(this.options.view, {
          model: this.model
        });

        this.$el.html(view.render().el);
      } else {
        data = {
          text: "Select an item to view it's details."
        };

        $(this.el).html(Mustache.to_html(tmpl_empty, data));
      }

      return this;
    }
  });

  return DetailsPanelView;
});
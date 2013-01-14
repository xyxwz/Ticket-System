/**
 * Widget Dependencies
 */

define(['jquery', 'underscore', 'backbone',
  'BaseView', 'mustache',
  'text!templates/widgets/TagForm.html'],
function($, _, Backbone, BaseView, mustache, tmpl_TagForm) {

  /**
   * Widget to Create Tags/Tasks
   *
   * @param {Backbone.Model} model ticket model
   * @param {Backbone.Collection} collection users to search from
   */

  var TagFormView = BaseView.extend({
    className: 'tags-form',
    events: {
      "mouseleave": "dispose",
      "click .color-picker li": "setColor",
      "keypress input[type=text]":  "createOnEnter"
    },

    initialize: function() {
      _.bindAll(this);
    },

    render: function() {
      var data = {
        colors: ticketer.colors
      };

      this.$el.html(Mustache.to_html(tmpl_TagForm, data));
      return this;
    },

    setColor: function(e) {
      var element = $(e.currentTarget);
          value = element.data('value');

      this.color = value;

      // Add Active Class to show it's selected
      this.$el.find('li.active').removeClass('active');
      element.addClass('active');

      $('input[type=text]').attr('disabled', false);
    },

    /**
     * When enter is pressed create a new comment model
     * and resize the textarea to 23px with no content
     *
     * @param {jQuery Event} e
     */

    createOnEnter: function(e) {
      var element = $('input[type=text]', this.$el);

      if (e.keyCode != 13) { return; }
      if (e.keyCode === 13 && !e.ctrlKey) {
        e.preventDefault();

        var self = this;

        ticketer.collections.lists.create({
          color: this.color,
          name: element.val()
        }, { wait: true });

        this.dispose();
      }
    }
  });

  return TagFormView;
});
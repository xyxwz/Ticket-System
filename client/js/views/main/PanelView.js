/**
 * View Dependencies
 */

define(['jquery', 'underscore', 'mustache', 'BaseView',
  'views/main/ListPanelView',
  'views/main/DetailsPanelView',
  'text!templates/main/container.html'],
function($, _, mustache, BaseView, ListView, DetailsView, tmpl_container) {

  /**
   * The main view for ticket lists
   *
   * @param {String} title
   */

  var PanelView = BaseView.extend({
    className: "container",

    events: {
      "click [role=panelTwo] .item": "changePanel"
    },

    initialize: function() {
      _.bindAll(this);

      this.bindTo($(window), 'resize', this.setPanelHeight);
    },

    render: function() {

      // Empty Panels
      this.$el.empty();

      // Render HTML Structure
      this.$el.html(Mustache.to_html(tmpl_container));

      // Make Panel fill viewport height
      this.setPanelHeight();

      this.panelTwo = new ListView({
        collection: this.collection,
        view: this.options.list,
        filter: this.options.filter || false
      });

      this.panelThree = new DetailsView({
        view: this.options.details
      });

      $('[role=panelTwo]', this.el).html(this.panelTwo.render().el);
      $('[role=panelThree]', this.el).html(this.panelThree.render().el);

      return this;
    },

    setPanelHeight: function() {
      var pageHeight = $(window).height(),
          headerHeight = $('header').height(),
          panelHeight;

      // Subtract an extra pixel for the border on the parent container
      panelHeight = (pageHeight - headerHeight) - 1;

      $('[role=panelTwo]', this.el).css('height', panelHeight);
      $('[role=panelThree]', this.el).css('height', panelHeight);
    },

    changePanel: function(e) {
      var id = $(e.currentTarget).data('id'),
          model;

      model = this.collection.get(id);

      // Destory current panel
      this.panelThree.dispose();

      this.panelThree = new DetailsView({
        view: this.options.details,
        model: model
      });

      $('[role=panelThree]', this.el).html(this.panelThree.render().el);

      this.selectItem(id);
    },

    selectItem: function(item) {
      this.$el.find('.active').removeClass('active');

      if(item) {
        this.$el.find('.item[data-id="' + item + '"]').addClass('active');
      }

      return this;
    }
  });

  return PanelView;
});
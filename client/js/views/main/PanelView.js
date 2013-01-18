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
      "click [role=panel-two] .item": "renderDetailsPanel"
    },

    initialize: function() {
      _.bindAll(this);

      this.bindTo($(window), 'resize', this.setPanelHeight);
      this.bindTo(this.collection, 'filter', this.renderListPanel);
    },

    render: function() {

      // Empty Panels
      this.$el.empty();

      // Render HTML Structure
      this.$el.html(Mustache.to_html(tmpl_container));

      // Make Panel fill viewport height
      this.setPanelHeight();

      this.renderListPanel();

      return this;
    },

    renderListPanel: function(filter) {
      if(this.panelTwo) {
        this.panelTwo.dispose();
      }

      this.panelTwo = new ListView({
        collection: this.collection,
        view: this.options.list,
        filter: filter || this.options.filter
      });

      this.renderDetailsPanel();
      $('[role=panel-two]', this.el).html(this.panelTwo.render().el);
    },

    /**
     * Render the details panel, if e is present,
     * pass the model to the details view.
     * Otherwise just create a new detailsview.
     *
     * @param {jQuery.Event} e
     */

    renderDetailsPanel: function(e) {
      if(this.panelThree) {
        this.panelThree.dispose();
      }

      if(e) {
        var id = $(e.currentTarget).data('id');
        var model = this.collection.get(id);

        this.panelThree = new DetailsView({
          view: this.options.details,
          model: model
        });

        this.selectItem(id);
      }
      else {
        this.panelThree = new DetailsView({
          view: this.options.details
        });
      }

      $('[role=panel-three]', this.el).html(this.panelThree.render().el);
    },

    setPanelHeight: function() {
      var pageHeight = $(window).height(),
          headerHeight = $('header').height(),
          panelHeight;

      // Subtract an extra pixel for the border on the parent container
      panelHeight = (pageHeight - headerHeight) - 1;

      $('[role=panel-two]', this.el).css('height', panelHeight);
      $('[role=panel-three]', this.el).css('height', panelHeight);
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
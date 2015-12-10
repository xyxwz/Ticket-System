/**
 * Widget Dependencies
 */

define(['jquery', 'underscore', 'backbone',
  'BaseView', 'mustache',
  'models/Template',
  'collections/Templates',
  'views/tickets/TicketFormView',
  'text!templates/widgets/TemplateForm.html'],
function($, _, Backbone, BaseView, mustache, TemplateModel,
  Templates, TicketFormView, tmpl_TemplateForm) {

  /**
   * Widget to Create new Ticket from Template
   *
   * @param {Backbone.Model} model ticket model
   * @param {Backbone.Collection} collection users to search from
   */

  var TemplateFormView = BaseView.extend({
    className: 'templates-form',
    events: {
      "click .template-picker li": "pickTemplate",
      "click .template-creator button": "newTemplate",
      "click .template-picker i": "deleteTemplate"
    },

    initialize: function() {
      var self = this;

      this.collection = new Templates(null);

      this.$el.on('click', function(e) {
        e.stopPropagation();
      });

      $('html').on('click.template-widget.data-api', function() {
        self.dispose();
      });
    },

    dispose: function() {
      $('html').off('click.template-widget.data-api');
      return BaseView.prototype.dispose.call(this);
    },

    render: function() {
      var self = this;

      this.collection.fetch({success: function() {
        var data = {
          templates: self.collection.models
        };

        self.$el.html(Mustache.to_html(tmpl_TemplateForm, data));

        if(!data.templates.length)
          $('ul', self.$el).append('<li>No templates found</li>')
      }});

      return this;
    },

    pickTemplate: function(e) {
      var element = $(e.currentTarget),
          value = element.data('value'),
          view = new TicketFormView();

      this.template = value;

      if($('[role=popup]').length || !value) return false;

      view.render();

      $('[role=description]', view.el).val(this.template);

      this.dispose();
    },

    newTemplate: function(e) {
      var view;

      if($('[role=popup]').length) return false;

      var TemplateCreateView = TicketFormView.extend({
        createTicket: function(e) {
          var title = $('[name=title]', view.el).val(),
              description = $('[role=description]', view.el).val(),
              template;

          template = new TemplateModel({
            title: title,
            description: description
          });

          template.save({}, {
            wait: true,
            success: function() {
              view.clearPopup();
            }
          });

          e.preventDefault();
        }
      });

      view = new TemplateCreateView();

      view.render();

      $('textarea', view.el).attr('placeholder', 'Enter a description of your template...');
      $('input', view.el).attr('placeholder', 'Template Name...');
      $('[data-action=create]', view.el).text('Save Template');
      $('.title', view.el).text('Create a Template');

      this.dispose();
    },

    deleteTemplate: function(e) {
      if(!ticketer.currentUser.isAdmin()) return false;

      var template = this.collection.get($(e.currentTarget).data('value'));
      var resp = confirm("Delete this template? This cannot be undone");
      if(resp) template.destroy();

      this.render();
    }
  });

  return TemplateFormView;
});
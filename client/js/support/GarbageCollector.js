/* Garbage Collector
 *
 * Manages views creation and destruction to prevent memory leaks.
 * All views should inherit from BaseView to allow proper 
 * Garbage Collection on view destruction.
 *
 * http://stackoverflow.com/questions/7567404/backbone-js-repopulate-or-recreate-the-view/7607853#7607853
 */
define(['jquery', 'underscore','backbone'], function($, _, Backbone) {

  var BaseView = function(options) {
    this.bindings = [];
    this.views = [];
    Backbone.View.apply(this, [options]);
  };

  _.extend(BaseView.prototype, Backbone.View.prototype, {

    /* Create a nested view
     * 
     * All views that are instatiated from within a view
     * aka nested views should use the createView function.
     * This adds the nested view to the BaseView views array and
     * runs destroy when the parent object is destroyed. 
     *     :name  - The view name to create. Must be available in
     *              the app namespace for it to be accessed in this module
     *      
     *     :args  - Any arguments the view make take such as 
     *              model or collections.
     *
     *  ex: this.createView(
     *        ticketer.views.tickets.show,
     *        {model: self.model}
     *      );
     */
    createView: function(name, args) {
      var view = new name(args);
      this.views.push(view);
      return view;
    },

    /* Model and collection bindings
     *
     * All bindings should use this function to ensure
     * that unbind is called when the view is trashed.
     * It adds the binding to the bindings array.
     *    :model     -  a model or collection to bind to
     *    :ev        -  an event to bind to
     *    :callback  -  a callback to run when event is triggered
     *
     *  ex:  this.bindTo(this.model, 'change', someFunction);
     */
    bindTo: function(model, ev, callback) {
      model.bind(ev, callback);
      this.bindings.push({ model: model, ev: ev, callback: callback });
    },

    unbindFromAll: function() {
      _.each(this.bindings, function(binding) {
        binding.model.unbind(binding.ev, binding.callback);
      });
      this.bindings = [];
    },

    trash: function(view) {
      view.unbindFromAll(); // this will unbind all events that this view has bound to 
      view.unbind(); // this will unbind all listeners to events from this view. This is probably not necessary because this view will be garbage collected.
      view.remove(); // uses the default Backbone.View.remove() method which removes this.el from the DOM and removes DOM events.
    },

    /* Dispose of view
     *
     * Is automatically triggered when a new view is rendered
     * while using the AppView application object. Usually 
     * referenced from the router. This unbinds all the bindings
     * in the bindings array and removes the el from the dom.
     * It can also be called manually, for example in a collection's
     * remove callback.
     */
    dispose: function () {
      var self = this;

      self.trash(this);

      // Loop through up to 2 levels of nested views and
      // trash the bindings
      _.each(this.views, function(view) {
        self.trash(view);
        if (view.views.length > 0) {
          _.each(view.views, function(nested) {
            self.trash(nested);
          });
        }
      });
      this.views = [];
    },

  });

  BaseView.extend = Backbone.View.extend;

  return BaseView;
});

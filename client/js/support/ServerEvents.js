/* Handle Events Coming From Socket.io */

define(['underscore', 'backbone'], function(_, Backbone) {

  var ServerEvents = function() {

    /**
     * Error Event
     */

    // Redirect on unauthorized
    ticketer.SSE.onerror = function(status) {
      if(status !== 401) return;
      window.location.replace(window.location.origin);
    };

    /**
     * Binding for a `ticket:new` event
     */

    ticketer.SSE.addEventListener('ticket:new', function(e) {
      var data = JSON.parse(e.data);
      ticketer.EventEmitter.trigger('ticket:new', data);
    });

    /**
     * Binding for a `ticket:update` event
     */

    ticketer.SSE.addEventListener('ticket:update', function(e) {
      var data = JSON.parse(e.data);
      ticketer.EventEmitter.trigger('ticket:update', data);
    });

    /**
     * Binding for a `ticket:remove` event
     */

    ticketer.SSE.addEventListener('ticket:remove', function(e) {
      var data = JSON.parse(e.data);
      ticketer.EventEmitter.trigger('ticket:remove', data);
    });

    /**
     * Binding for a `comment:new` event
     */

    ticketer.SSE.addEventListener('comment:new', function(e) {
      var data = JSON.parse(e.data);
      ticketer.EventEmitter.trigger('comment:new', data);
    });

    /**
     * Binding for a `comment:update` event
     */

    ticketer.SSE.addEventListener('comment:update', function(e) {
      var data = JSON.parse(e.data);
      ticketer.EventEmitter.trigger('comment:update', data);
    });

    /**
     * Binding for a `comment:remove` event
     */

    ticketer.SSE.addEventListener('comment:remove', function(e) {
      var data = JSON.parse(e.data);
      ticketer.EventEmitter.trigger('comment:remove', data);
    });

  };

  return ServerEvents;
});
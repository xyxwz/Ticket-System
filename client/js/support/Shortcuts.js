/**
 * Keyboard Shortcut Triggers
 */

define(['jquery', 'underscore', 'backbone', 'Mousetrap', 'mustache',
  'views/dialogs/MarkdownGuide'
], function($, _, Backbone, Mousetrap, mustache, MarkdownGuide) {

  function Shortcuts() {

    // Key Bindings
    Mousetrap.bind('m', showMarkdownGuide);
    Mousetrap.bind('c', showTicketForm);

    // Bind Functions
    function showMarkdownGuide(e) {
      new MarkdownGuide();
    }

    function showTicketForm(e) {
      ticketer.EventEmitter.trigger('popup:TicketForm');
    }

  }

  return Shortcuts;
});
/**
 * Keyboard Shortcut Triggers
 */

define(['jquery', 'underscore', 'backbone', 'Mousetrap', 'mustache',
  'views/dialogs/MarkdownGuide'
], function($, _, Backbone, Mousetrap, mustache, MarkdownGuide) {

  function Shortcuts() {

    // Key Bindings
    Mousetrap.bind('m', showMarkdownGuide);

    // Bind Functions
    function showMarkdownGuide(e) {
      new MarkdownGuide();
    }

  }

  return Shortcuts;
});
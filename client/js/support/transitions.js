/* Transitions for smoother view changes */
define(['jquery', 'text!templates/headers/FullHeader.html'], 
function($, FullHeaderTmpl) {
  
  var Transitions = {};

  /* Draw and transition header/nav html
   * 
   * Adds the correct page header/nav to the DOM and
   * used the jQuery fade animation to create a smoother
   * transition when changing views.
   *    :header - a div ID used to determine which
   *              header template to draw.
   *    :tab    - (optional) a div ID used if the view 
   *              contains a tabbed navigation. 
   *              Highlights the tab.
   */ 
  Transitions.headers = function(header, tab) {
    
    /* Only transition to new header if needed.
     *
     * Header is wrapped in a unique id div
     * based on page so only transision if this is not
     * the currently displayed header. Also set class on 
     * correct tab to highlight view state. */
    if ($('header #' + header).length === 0) {

      // Not the correct header so fadeOut to transition
      $('header').fadeOut('fast', function() {
        // Draw new header
        var html = getHeaderTemplate(header);
        var headerTmpl = $('<div id="'+ header + '"></div>').html(html);
        $('header').html(headerTmpl);
        // Set highlight state before fadeIn
        if(typeof(tab) != 'undefined') { setHighlightState(tab); }
      }).fadeIn('fast');
    }
    else {
      setHighlightState(tab);
    }
  }

  /* Set the correct header template to use.
   *   :header - a div ID used to determine which
   *             header template to draw
   *
   * returns the HTML of the template */ 
  function getHeaderTemplate(header) {
    switch(header) {
      case 'ticketIndexHeader':
        return FullHeaderTmpl;
        break;
      case 'ticketDetailsHeader':
        return ticketer.views.headers.back.render().el;
        break;
    }
  }

  /* Set highlight state on correct tab
   *
   * On headers that contain multiple tabs this
   * sets the correct highlighted state (.yellow) on
   * the selected tab. Checks that the tab isn't currently 
   * highlighted then clears out all highlights on the tabs 
   * and adds class to correct tab.
   *    :tab - a div ID to represent the desired page tab
   */
  function setHighlightState(tab) {
    if ($('#' + tab + ' .yellow', 'header').length === 0) {
      $('header li').removeClass('yellow');
      $('#' + tab, 'header').addClass('yellow');
    }
  }

  return Transitions;
});
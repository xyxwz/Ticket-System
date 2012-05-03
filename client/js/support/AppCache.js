/* Handle Cache Updates Automatically */

define([], function() {

  var AppCache = function() {
    // Check for manifest update every 10 minutes
    setInterval(function() {
      applicationCache.update();
    }, 600000);

    // Request Page Reload if manifest has changed
    if (window.applicationCache) {
      applicationCache.addEventListener('updateready', function() {
        if (confirm('An update is available. Reload now?')) {
          window.location.reload();
        }
      });
    }
  };

  return AppCache;
});

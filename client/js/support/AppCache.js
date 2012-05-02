/* Handle Cache Updates Automatically */

define([], function() {

  var AppCache = function() {
    // Check for manifest update every 10 seconds
    setInterval(function() {
      console.log('checking for update');
      applicationCache.update();
    }, 10000);

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

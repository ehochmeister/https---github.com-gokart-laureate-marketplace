require(['./app.js'], function(app) {
  console.log('started index.js');
  $(document).ready(function() {
    console.log('jquery ready');
  });
  $(document).foundation();
})

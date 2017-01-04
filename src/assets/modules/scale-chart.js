require('./scale-chart.scss');

$('.scale-chart').each(function(idx, el) {
  var $el = $(el);
  var position = parseFloat($el.data('position'));
  $el.children().css('left', (100 * position) + '%');
});

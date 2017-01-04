require('./accordion-tabs.scss');

$('.accordion-tabs').on('click', '.accordion-tabs--title a', function(event) {
  event.preventDefault();
  var $tabs = $(event.delegateTarget);
  var $titles = $tabs.find('.accordion-tabs--title');
  var $contents = $tabs.find('.accordion-tabs--content');
  var href = event.target.hash;

  $titles.removeClass('is-active').filter(function(idx, el) {
    var links = $(el).children('a');
    return links.length && links[0].hash === href;
  }).addClass('is-active');
  if (href) {
    $contents.removeClass('is-active').filter(href).addClass('is-active');
  }
});

$('.accordion-tabs--title > a').each(function(idx, el) {
  var href = el.hash;
  var $el = $(el);

  $(el).parent().addClass('show-for-medium');
  if (href) {
    $(href).before(
      $('<div class="accordion-tabs--title accordion-tabs--title__block show-for-small-only"></div>').append(
        $('<a />').attr('href', href).text($el.text())
      ).toggleClass('is-active', $el.parent().hasClass('is-active'))
    );
  }
});

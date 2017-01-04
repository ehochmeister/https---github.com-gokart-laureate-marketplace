
$('.interest-form').each(function(idx, el) {
  var $el = $(el);
  var $form = $el.find('form');
  var to = 'erich.hochmeister@laureate.net';
  var subject = 'There’s interest about a feature on Marketplace';
  var bodyPrefixSingular = 'I’m interested in this solution… ';
  var bodyPrefixPlural = 'I’m interested in these solutions… ';
  var currentSolution = $('.heading h1').text().toLowerCase();
  var $inputs = $form.find('input[type="checkbox"]').not('.interest-form--check-all');
  var $multipleButton = $el.find('.interest-form--multiple');

  function updateMultipleButton() {
    var $checkedInputs = $inputs.filter(':checked');
    $inputs.not($checkedInputs).parent().removeClass('input-active');
    $checkedInputs.parent().addClass('input-active');
  }

  $el.find('.interest-form--current').on('click', function() {
    var $form = $el.find('.interest-form--form');
    if (!$form.is(':visible')) {
      $form.slideDown();
    }
    $inputs.filter(function(idx, el) {
      return el.value.toLowerCase() === currentSolution;
    }).prop('checked', true);
    updateMultipleButton();
  });

  $el.find('.interest-form--multiple').on('click', function(event) {
    event.preventDefault();
    if ($inputs.filter(':checked').length === 0) {
      alert('You haven’t chosen any solutions');
      return;
    }
    var topics = $inputs.filter(':checked').map(function(idx, el) {
      return el.value;
    }).toArray();
    $.post('https://hooks.zapier.com/hooks/catch/1183949/tqlo5x/', {
      'str': topics.join(', ')
    }).done(function() {
      $el.find('.interest-form--multiple').prop('disabled', true).text('Thank you. Your interests were sent.')
    })
  });

  $form.find('.interest-form--check-all').on('change', function(event) {
    $inputs.prop('checked', $(event.currentTarget).prop('checked'));
    updateMultipleButton();
  });

  updateMultipleButton();
  $inputs.on('change', updateMultipleButton);
});

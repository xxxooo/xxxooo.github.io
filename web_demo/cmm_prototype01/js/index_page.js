$('.carousel.carousel-slider').carousel({full_width: true, dist: 0});
$('.slider').slider({indicators: false, height: 448});

setInterval(function(){
  $('.carousel.carousel-slider').carousel('next');
}, 5500);

$('.card').hover(
  function(){
    $(this).removeClass('z-depth-0');
  },
  function(){
    $(this).addClass('z-depth-0');
  }
);

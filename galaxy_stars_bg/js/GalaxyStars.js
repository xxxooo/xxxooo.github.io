$().ready(function () {
    // Random Stars
    var generateStars = function () {
        var $galaxy = $(".galaxy"),
            galaxyWidth = $galaxy.width(),
            galaxyHeight = $galaxy.height(),
            starNumLimit = galaxyWidth * galaxyHeight / 2048;

        // clear all stars after resize
        $galaxy.empty();
        for (var i = 0; i < starNumLimit; i++) {
            var starType = Math.floor(Math.random() * Math.random() * 5),
                twinkleType = Math.floor(Math.random() * 4),
                delaySec = Math.random() * -8 + 's';

            $('<div/>',{
                class: 'star star-m'+ starType +' twinkle'+ twinkleType,
                css: {
                  '-webkit-animation-delay': delaySec,
                  '-moz-animation-delay': delaySec,
                  '-o-animation-delay': delaySec,
                  'animation-delay': delaySec
                }
            }).appendTo($galaxy).css({
                top: galaxyHeight * Math.random(),
                left: galaxyWidth * Math.random()
            });
        }
    };
    generateStars();

    var restarTimeout;
    $(window).resize(function () {
        if (restarTimeout) clearTimeout(restarTimeout);
        restarTimeout = setTimeout(generateStars, 666);
    });

    $('#twinkleSwitch').on('click',function () {
        $('.galaxy').toggleClass('freeze');
    });
    $('#flutterSwitch').on('click',function () {
        $('.clouds').toggleClass('freeze');
    });
    $('input[name="animation"]').on('change', function() {
        $('.clouds').removeClass(
            $('input[name="animation"]:not(:checked)').val()
        ).addClass(
            $(this).val()
        );
    });
})

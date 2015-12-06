var figureStart = {
    html: [
        '<h2>Welcome to Beat Follower!</h2>',
        '<div>',
            '<p><k>Left Click</k> to <b>Beat Up</b></p>',
            '<p><k>Right Click</k> to <b>Beat Down</b></p>',
            '<p>Press keys <k>Q to R</k>, <k>A to F</k> and <k>Z to C</k> to use <b>Modifiers</b>.</p>',
            '<p>Press keys <k>1 to 9</k> to switch between <b title="This text itself is considered a Figure!">Figures</b></p>',
            '<p><i>Use this website with music in the background and beat to it!</i></p>',
        '</div>',
    ].join('\n'),
    onColoring: function() {
        beatWrapperEl.children().css('color', color.brighter().getHex());
        beatWrapperEl.find('k').css('color', color.darker(.8).getHex());
    }
}, figureWIP = {
    html: '<span class="text middle">Work In Progress</span>',
    onColoring: function() { beatWrapperEl.children().css('color', color.brighter().getHex()); }
}, figures = [
    { // fig-1
        html: [
            '<div class="circle"></div>',
            '<div class="line middle">',
            '<div class="inner-line left up" style="visibility: hidden;"></div>',
            '<div class="inner-line left down" style="visibility: hidden;"></div>',
            '<div class="inner-line right up" style="visibility: hidden;"></div>',
            '<div class="inner-line right down" style="visibility: hidden;"></div>',
            '</div>',
        ].join('\n'),
        onColoring: function() {
            var lineEl = beatWrapperEl.find('.line'),
                circle = beatWrapperEl.find('.circle');
            lineEl.css('background-color', new Color('red').addColor(color, [true, false, false, false]).getHex());
            circle.css('background-color', color.getHex());
            circle.css('border-color', color.brighter().getHex());
        },
        onAfterBeatStart: function(isUp) { if(isUp) beatWrapperEl.find('.inner-line').css('visibility', 'visible'); },
        onBeforeBeatEnd: function(isUp) { beatWrapperEl.find('.inner-line').css('visibility', 'hidden'); }
    },
    { // fig-2
        html: [
            '<div class="center-cube"></div>',
            '<div class="cube left up"></div>',
            '<div class="cube left down"></div>',
            '<div class="cube right up"></div>',
            '<div class="cube right down"></div>',
        ].join('\n'),
        onColoring: function() {
            beatWrapperEl.find('.center-cube').css('background-color', color.getHex());
            beatWrapperEl.find('.center-cube').css('border-color', color.brighter().getHex());
            beatWrapperEl.find('.cube').css('background-color', color.brighter().getHex());
        }
    },
    { // fig-3
        html: [
            '<div class="circles">',
                '<div class="circle middle" style="width: 5%; height: 5%;"></div>',
                '<div class="circle middle" style="width: 15%; height: 15%;"></div>',
                '<div class="circle middle" style="width: 25%; height: 25%;"></div>',
                '<div class="circle middle" style="width: 35%; height: 35%;"></div>',
                '<div class="circle middle" style="width: 45%; height: 45%;"></div>',
                '<div class="circle middle" style="width: 55%; height: 55%;"></div>',
                '<div class="circle middle" style="width: 65%; height: 65%;"></div>',
                '<div class="circle middle" style="width: 75%; height: 75%;"></div>',
                '<div class="circle middle" style="width: 85%; height: 85%;"></div>',
                '<div class="circle middle" style="width: 95%; height: 95%;"></div>',
            '</div>',
            '<div class="line horizontal middle"></div>',
            '<div class="line vertical middle"></div>'
        ].join('\n'),
        onColoring: function() {
            beatWrapperEl.find('.line').css('background-color', color.opposite().getHex());
            beatWrapperEl.find('.circles .circle').css('border-color', color.darker(.975).getHex());
        }
    },
    { // fig-4
        html: [
            '<div class="triangle">',
                '<div class="eye middle"></div>',
                '<div class="pupil middle"></div>',
                '<div class="triangle" style="position: relative;"></div>',
            '</div>',
        ].join('\n'),
        onColoring: function() {
            var triangle = beatWrapperEl.find('.triangle');
            triangle.css('border-bottom-color', color.brighter().getHex());
            triangle.children('.eye').css('background-color', color.getHex());
            triangle.children('.pupil').css('background-color', color.darker().getHex());
        }
    }
];
var modifiers = {
    'Q': { toggle: true, disable: ['W'] },  /* Toggle Interval between directions */
    'W': { toggle: false, disable: ['Q'] }, /* Press Interval between directions */
    'E': { toggle: true, disable: ['R'] },  /* Toggle Parallax mode */
    'R': { toggle: true, disable: ['E'] },  /* Toggle Crazy Parallax mode */
    'A': { /* Press On beat text */
        toggle: false,
        words: [
            'woohoo!',
            'yeah!',
            'lets go',
            'c\'mon'
        ],
        onStart: function() { this.span = $('<span class="a-mod middle"></span>').appendTo(beatEl); },
        onBeforeBeatStart: function(isUp, beatDuration) {
            if(!this.on || !isUp) return;
            var that = this;
            that.span.clearQueue().finish();
            that.span.css('visibility', 'visible');
            that.span.text(that.words[halp.dice(0, that.words.length)]);
            that.span.css('color', new Color('#FF00FF').addColor(color, [true, false, true, false]).getHex());
            that.span.animate({ fontSize: 20 + 'vmin' }, {
                duration: beatDuration,
                easing: 'linear'
            })
        },
        onBeforeBeatEnd: function(isUp, beatDuration) {
            var that = this;
            that.span.clearQueue().finish();
            that.span.animate({ fontSize: .1 + 'vmin' }, {
                duration: beatDuration,
                easing: 'linear',
                complete: function() { that.span.css('visibility', 'hidden'); }
            })
        }
    },
    'S': { toggle: false, disable: ['F'] }, /* Press Slow spinning */
    'D': { toggle: false },                 /* Press Pause spinning */
    'F': { toggle: false, disable: ['S'] }, /* Press Fast spinning */
    'Z': { toggle: false },                 /* TODO */
    'X': { toggle: false },                 /* TODO */
    'C': { toggle: false }                  /* TODO */
};
var currentIndex, current, color;
var beatEl, beatWrapperEl, mouseCanvasEl, modifiersEl, warningsEl;
var currentBeating = { up: false, down: false},
    lastPressTimestamp;
    lastDirection = 'normal',
    parallax = { top: window.innerWidth / 2, left: window.innerHeight },
    lastMousePos = parallax,
    crazyParallaxInterval = undefined,
    crazyParallaxBool = false,
    pressedKey = [ ];

function doGeneralColoring() {
    color = halp.randColor();
    warningsEl.css('color', color.brighter().getHex());
    beatEl.css('background-color', color.getHex());
    if(current.onColoring) current.onColoring();
    for(var k in modifiers)
        if(modifiers[k].onColoring) modifiers[k].onColoring();
}

function beatClick(e) {
    var isUp = e.button === 0;
    beatWrapperEl.children().clearQueue().finish();
    if(e.type === 'mousedown') {
        if(currentBeating.down) return;
        doGeneralColoring();
        lastPressTimestamp = Date.now();
        currentBeating.up = false;
        currentBeating.down = true;
        var duration = isUp ? 50 : 50;
        if(current.onBeforeBeatStart) current.onBeforeBeatStart(isUp, duration);
        for(var k in modifiers)
            if(modifiers[k].onBeforeBeatStart) modifiers[k].onBeforeBeatStart(isUp, duration);
        setTimeout(function() {
            beatWrapperEl.children().animate({ zoom: isUp ? 1.25 : .75 }, {
                duration: duration,
                easing: 'linear',
                complete: function() {
                    if(current.onAfterBeatStart) current.onAfterBeatStart(isUp);
                    for(var k in modifiers)
                        if(modifiers[k].onAfterBeatStart) modifiers[k].onAfterBeatStart(isUp);
                }
            });
        }, 1);

        if(modifiers['Q'].on || modifiers['W'].on || e.button === 1)
            lastDirection = lastDirection === 'normal' ? 'reverse' : 'normal';
        beatWrapperEl.css('animation-direction', lastDirection);
    } else if(e.type === 'mouseup') {
        if(currentBeating.up) return;
        currentBeating.down = false;
        currentBeating.up = true;
        var duration = isUp ? 100 : 50;
        if(lastPressTimestamp + duration * 2 < Date.now())
            duration = Math.min((Date.now() - lastPressTimestamp), 4000);
        if(current.onBeforeBeatEnd) current.onBeforeBeatEnd(isUp, duration);
        for(var k in modifiers)
            if(modifiers[k].onBeforeBeatEnd) modifiers[k].onBeforeBeatEnd(isUp, duration);
        setTimeout(function() {
            beatWrapperEl.children().animate({ zoom: 1 }, {
                duration: duration,
                easing: 'linear',
                complete: function() {
                    if(current.onAfterBeatEnd) current.onAfterBeatEnd(isUp);
                    for(var k in modifiers)
                        if(modifiers[k].onAfterBeatEnd) modifiers[k].onAfterBeatEnd(isUp);
                }
            });
        }, 1);
    }
}

function keyPress(e) {
    var keyCode = e.keyCode || e.which,
        key = String.fromCharCode(keyCode),
        isUp = e.type === 'keyup';
    if(pressedKey[keyCode] && !isUp) return;
    pressedKey[keyCode] = !isUp;
    if(keyCode === 32) { // space
        beatClick({
            type: e.type.replace('key', 'mouse'),
            button: 0
        });
        return;
    }
    if($.isNumeric(parseInt(key))) {
        render(parseInt(key));
        return;
    }
    var m;
    for(var k in modifiers) {
        m = modifiers[k];
        if(m.on) allOff = false;
        if(m.key !== key.toUpperCase()) continue;
        if(isUp) m._keyup = true;
        if(!m.toggle) m.on = !isUp;
        else if(!isUp && m._keyup) {
            m.on = !m.on;
            m._keyup = false;
        }
        if(m.on) {
            m.el.addClass('active');
            if(m.disable) m.disable.forEach(function(k) {
                modifiers[k].on = false;
                modifiers[k].el.removeClass('active')
            });
        } else m.el.removeClass('active');
        if(current.onModifier) current.onModifier(m);
        break;
    }
    var allOff = true;
    for(var k in modifiers)
        if(modifiers[k].on) {
            allOff = false;
            break
        }
    modifiersEl.css('visibility', allOff ? 'hidden' : 'visible');

    if(m) onModifier(m);
}

function onModifier(m) {
    switch(m.key) {
        default: return;
        case 'S':
            beatWrapperEl.css('animation-duration', (m.on ? 2 : 1) + 's');
            return;
        case 'F':
            beatWrapperEl.css('animation-duration', (m.on ? .5 : 1) + 's');
            return;
        case 'D':
            beatWrapperEl.css('animation-play-state', (m.on ? 'paused' : 'running'));
            return;
    }
}

function doParallax() {
    beatWrapperEl.css('top', '');
    beatWrapperEl.css('left', '');
    if(!(modifiers['E'].on || modifiers['R'].on)) return;
    crazyParallaxBool = !crazyParallaxBool;
    if(modifiers['E'].on && !crazyParallaxBool) return;
    parallax = {
        top: ($(window).height() / 2 - lastMousePos.top) / 3,
        left: ($(window).width() / 2 - lastMousePos.left) / 3
    };
    beatWrapperEl.css('top', 'calc(50vh + ' + parallax.top + 'px)');
    beatWrapperEl.css('left', 'calc(50vw + ' + parallax.left + 'px)');
}

function render(index) {
    beatWrapperEl.children().remove();
    warningsEl.hide();
    if(index <= 0) {
        beatEl.attr('figure', 'start');
        currentIndex = Number.NaN;
        current = figureStart;
        beatEl.children('link').prop('href', './figures/start.css');
        warningsEl.show();
    } else if(index > figures.length) {
        beatEl.attr('figure', 'WIP');
        currentIndex = Number.NaN;
        current = figureWIP;
        beatEl.children('link').prop('href', './figures/WIP.css');
    } else {
        beatEl.attr('figure', index);
        index--;
        currentIndex = index;
        current = figures[index];

        beatEl.children('link').prop('href', './figures/' + (index + 1) + '.css');
    }
    beatWrapperEl.prop('style', '');
    beatWrapperEl.append(current.html);
    doGeneralColoring();
}

var halp = {
    dice: function(min, max) { return Math.floor(Math.random() * (max - min)) + min; },
    randomBool: function() { return Math.random() >= .5; },
    randColor: function() { return new Color('rgb(' + halp.dice(50, 250) + ', ' + halp.dice(50, 250) + ', ' + halp.dice(50, 250) + ')'); }
}

$(function() {
    beatEl = $('#beat');
    beatWrapperEl = beatEl.children('.beat_wrapper');

    beatWrapperEl.css('animation-duration', '1s');
    beatWrapperEl.css('animation-play-state', 'running');
    beatWrapperEl.css('animation-direction', lastDirection);

    $(document).on('mouseup', beatClick);
    $(document).on('mousedown', beatClick);
    $(document).on('contextmenu', function(e) { return false; });
    $(document).on('keyup', keyPress);
    $(document).on('keydown', keyPress);
    $(document).on('mousemove', function(e) {
        lastMousePos = { top: e.pageY, left: e.pageX};
        doParallax();
    });

    warningsEl = $('#warnings');

    modifiersEl = $('#modifiers');
    for(var k in modifiers) {
        var m = modifiers[k];
        m.key = k.toUpperCase();
        m.el = $([
            '<div class="modifier ' + (m.toggle ? 'toggle' : 'press') + '" key="' + k.toUpperCase() + '">',
                '<span>' + k.toUpperCase()+ '</span>',
            '</div>'
        ].join('\n')).appendTo(modifiersEl);
        m.on = false;
        if(m.toggle) m._keyup = true;
        if(m.onStart) m.onStart();
    }

    crazyParallaxInterval = setInterval(doParallax, 25);

    render(0);
});
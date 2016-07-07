Math.easeInOutQuad = function (t, b, c, d) {
    t /= d / 2;
    if (t < 1) {
        return c / 2 * t * t + b;
    }
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
};

var requestAnimFrame = (function () {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

var Animate = {

    scrollTo: function (element, to, duration, callback) {

        function move(amount) {
            if (element === document) {
                document.documentElement.scrollTop = amount;
                document.body.parentNode.scrollTop = amount;
                document.body.scrollTop = amount;
            } else {
                element.scrollTop = amount;
            }
        }

        function position() {
            if (element === document) {
                return document.documentElement.scrollTop || document.body.parentNode.scrollTop || document.body.scrollTop;
            }

            return element.scrollTop;
        }

        var start = position(),
            change = to - start,
            currentTime = 0,
            increment = 20;
        duration = (typeof(duration) === 'undefined') ? 500 : duration;

        if (duration === 0) {
            move(to);
            if (callback && typeof(callback) === 'function') {
                // the animation is done so lets callback
                callback();
            }
            return;
        }

        var animateScroll = function () {
            // increment the time
            currentTime += increment;
            // find the value with the quadratic in-out easing function
            var val = Math.easeInOutQuad(currentTime, start, change, duration);
            // move the document.body
            move(val);
            // do the animation unless its over
            if (currentTime < duration) {
                requestAnimFrame(animateScroll);
            } else {
                if (callback && typeof(callback) === 'function') {
                    // the animation is done so lets callback
                    callback();
                }
            }
        };

        animateScroll();
    }
};

var DOM = {
    offset: function (el) {
        var rect = el.getBoundingClientRect();

        return {
            top:  rect.top + document.body.scrollTop,
            left: rect.left + document.body.scrollLeft
        };
    },

    select: function (selector) {
        return document.querySelector(selector);
    },

    html: function (ele, html) {
        if (!html) {
            return ele.innerHTML;
        }

        ele.innerHTML = html;
    },

    selectAll: function (selector) {
        return document.querySelectorAll(selector);
    },

    removeClass: function (el, className) {
        if (el.classList) {
            el.classList.remove(className);
        } else {
            el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    },

    addClass: function (el, className) {
        if (el.classList) {
            if (className.indexOf(' ') >= 0) {
                var list = className.split(' ');
                _.each(list, function (element) {
                    el.classList.add(element);
                });
            } else {
                el.classList.add(className);
            }
        } else {
            el.className += ' ' + className;
        }
    }
};

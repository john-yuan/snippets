/**
 * Merge the `source` into the `target`. This function will do deep copy, and
 * modify the target object.
 *
 * @param {Object.<string, *>|any[]} target The target to merge into
 * @param {Object.<string, *>|any[]} srouce The source to copy
 * @returns {Object.<string, *>|any[]} returns The modified target
 */
var merge = function(target, source) {
    var toString = Object.prototype.toString;
    var hasOwn = Object.prototype.hasOwnProperty;

    var isArray = function (it) {
        return '[object Array]' === toString.call(it);
    };

    var isObject = function (it) {
        if (!it || '[object Object]' !== toString.call(it)) {
            return false;
        }
        if (it.constructor && it.constructor !== Object) {
            return false;
        }
        if (typeof Object.getPrototypeOf === 'function') {
            if (Object.getPrototypeOf(it) !== Object.prototype) {
                return false;
            }
        }
        if (typeof window === 'object' && window && window.window === window) {
            if (it === window) {
                return false;
            }
        }
        if (typeof global === 'object' && global && global.global === global) {
            if (it === global) {
                return false;
            }
        }
        return true;
    };

    var merge = function (target, source) {
        var key, val;

        if ( target && ( isArray(source) || isObject(source) ) ) {
            for ( key in source ) {
                if ( hasOwn.call(source, key) ) {
                    val = source[key];
                    if (val !== undefined) {
                        if ( isObject(val) ) {
                            if ( ! isObject(target[key]) ) {
                                target[key] = {};
                            }
                            merge(target[key], val);
                        } else if ( isArray(val) ) {
                            if ( ! isArray(target[key]) ) {
                                target[key] = [];
                            }
                            merge(target[key], val);
                        } else {
                            target[key] = val;
                        }
                    }
                }
            }
        }

        return target;
    };

    return merge(target, source);
};

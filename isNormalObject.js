/**
 * Check wether the variable passed in is a normal object. Normal object means
 * an object that is created by `{}` or `new Object()`.
 *
 * @param {any} it The variable to check
 * @returns {boolean} Returns `true` if `it` is a normal object
 */
var isNormalObject = function (it) {
    if (!it || '[object Object]' !== {}.toString.call(it)) {
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

// TEST
var assertTrue = function (value, message) {
if (value !== true) {
    setTimeout(function () {
        throw new Error(message);
    });
} else {
    console.log('Passed: ' + message);
}
};

assertTrue(isNormalObject({}) === true, '{} is a normal object');
assertTrue(isNormalObject(new Object()) === true, 'new Object() is a normal object');
assertTrue(isNormalObject(Promise) === false, 'Promise is not a normal object');
assertTrue(isNormalObject(JSON) === false, 'JSON is not a normal object');
assertTrue(isNormalObject(Date) === false, 'Date is not a normal object');
assertTrue(isNormalObject(Function) === false, 'Function is not a normal object');
assertTrue(isNormalObject(false) === false, 'false is not a normal object');
assertTrue(isNormalObject(true) === false, 'true is not a normal object');
assertTrue(isNormalObject(0) === false, '0 is not a normal object');
assertTrue(isNormalObject(1) === false, '1 is not a normal object');
assertTrue(isNormalObject(null) === false, 'null is not a normal object');
assertTrue(isNormalObject(undefined) === false, 'undefined is not a normal object');
assertTrue(isNormalObject(function() {}) === false, 'function() {} is not a normal object');
assertTrue(isNormalObject('str') === false, '\'str\' is not a normal object');
assertTrue(isNormalObject(new Promise(function() {})) === false, 'new Promise(function() {}) is not a normal object');
assertTrue(isNormalObject(new Date()) === false, 'new Date() is not a normal object');
assertTrue(isNormalObject(new (function A() {})) === false, 'new (function A() {}) is not a normal object');
assertTrue(isNormalObject([]) === false, '[] is not a normal object');

if (typeof global !== 'undefined') {
assertTrue(isNormalObject(global) === false, 'global is not a normal object');
} else if (typeof window !== 'undefined') {
assertTrue(isNormalObject(window) === false, 'window is not a normal object');
assertTrue(isNormalObject(document.body) === false, 'document.body is not a normal object');
}

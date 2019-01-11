var SimpleEvent = (function () {
    /**
     * A simple event registry, designed to exchange message among components
     *
     * API:
     *
     * * `SimpleEvent.prototype.emit(eventName, message)`
     * * `SimpleEvent.prototype.on(eventName, listener)`
     * * `SimpleEvent.prototype.off(eventName, listener)`
     * * `SimpleEvent.prototype.once(eventName, listener)`
     * * `SimpleEvent.prototype.removeOnce(eventName, listener)`
     * * `SimpleEvent.prototype.removeAllNormalListeners(eventName)`
     * * `SimpleEvent.prototype.removeAllOnceListeners(eventName)`
     *
     * @class
     */
    var SimpleEvent = function () {
        this._on_callbacks = {};
        this._once_callbacks = {};
    };

    /**
     * Emit an event with the spceified message.
     * All the listeners that registerd with `on` and `once` will be exectued.
     *
     * @param {string} eventName the name of event to be emitted
     * @param {any} message the message pass to the listeners
     * @return {ThisType}
     */
    SimpleEvent.prototype.emit = function (eventName, message) {
        var on = this._on_callbacks[eventName];
        var once = this._once_callbacks[eventName];
        var i;
        var length;
        var execute = function (fn, message) {
            try {
                fn(message);
            } catch (err) {
                // throw the error asynchronously
                // there is no way to capture the error
                setTimeout(function () {
                    throw err;
                });
            }
        };

        if (isArray(once)) {
            // reset the once callbacks array, for it will be called only once
            delete this._once_callbacks[eventName];
            for (i = 0, length = once.length; i < length; i += 1) {
                execute(once[i], message);
            }
        }

        if (isArray(on)) {
            // copy the array, in case new listener be registered or removed
            // during the execution of the callback
            on = on.slice();
            for (i = 0, length = on.length; i < length; i += 1) {
                execute(on[i], message);
            }
        }
    };

    /**
     * Register a event listener
     *
     * @param {string} eventName the name of the event to listen
     * @param {(message: any) => void} listener the event listener to be registered
     * @return {ThisType}
     * @throws {TypeError}
     */
    SimpleEvent.prototype.on = function (eventName, listener) {
        // check whether listener is a function
        if (!isFunction(listener)) {
            throw new TypeError('listener must be a function');
        }

        // get the callback list
        var on = this._on_callbacks;
        var cbs = isArray(on[eventName]) ? on[eventName] : [];

        // save the listener
        cbs.push(listener);
        // set the list back
        on[eventName] = cbs;

        return this;
    };

    /**
     * Remove the listener that registered with `SimpleEvent#on(eventName, listener)`
     *
     * @param {string} eventName the name of the event
     * @param {(message: any) => void} listener the event listener to be removed
     * @return {ThisType}
     */
    SimpleEvent.prototype.off = function (eventName, listener) {
        var on = this._on_callbacks;
        var cbs = on[eventName];
        var index = null;

        if (isArray(cbs)) {
            index = indexOf(listener, cbs);
            if (index > -1) {
                do {
                    // remove the listener
                    cbs.splice(index, 1);
                    // find the next one
                    index = indexOf(listener, cbs);
                } while (index > -1);
            }
        }

        return this;
    };

    /**
     * Register event listener that execute only once
     *
     * @param {string} eventName the name of the event to listen
     * @param {(message: any) => void} listener the event listener to be registered
     * @return {ThisType}
     * @throws {TypeError}
     */
    SimpleEvent.prototype.once = function (eventName, listener) {
        // check whether listener is a function
        if (!isFunction(listener)) {
            throw new TypeError('listener must be a function');
        }

        // get the callback list
        var once = this._once_callbacks;
        var cbs = isArray(once[eventName]) ? once[eventName] : [];

        // save the listener
        cbs.push(listener);
        // set the list back
        once[eventName] = cbs;

        return this;
    };

    /**
     * Remove the listener that registered with `SimpleEvent#once(eventName, listener)`
     *
     * @param {string} eventName the name of the event
     * @param {(message: any) => void} listener the event listener to be removed
     * @return {ThisType}
     */
    SimpleEvent.prototype.removeOnce = function (eventName, listener) {
        var once = this._once_callbacks;
        var cbs = once[eventName];
        var index = null;

        if (isArray(cbs)) {
            index = indexOf(listener, cbs);
            if (index > -1) {
                do {
                    // remove the listener
                    cbs.splice(index, 1);
                    // find the next one
                    index = indexOf(listener, cbs);
                } while (index > -1);
            }
        }

        return this;
    };

    /**
     * remove all listeners that registerd with `SimpleEvent#on(eventName, listener)`
     *
     * @param {string} eventName the name of the event
     * @return {ThisType}
     */
    SimpleEvent.prototype.removeAllNormalListeners = function (eventName) {
        var on = this._on_callbacks;

        if (isArray(on[eventName])) {
            delete on[eventName];
        }
    };

    /**
     * remove all listeners that registerd with `SimpleEvent#once(eventName, listener)`
     *
     * @param {string} eventName the name of the event
     * @return {ThisType}
     */
    SimpleEvent.prototype.removeAllOnceListeners = function (eventName) {
        var once = this._once_callbacks;

        if (isArray(once[eventName])) {
            delete once[eventName];
        }
    };

    /**
     * Check whether the item is a function
     *
     * @param {any} it the item to be checked
     * @returns {boolean} returns `true` on it is a function, otherwise `false` is returned.
     */
    var isFunction = function (it) {
        return {}.toString.call(it) === '[object Function]';
    };

    /**
     * Check whether the item is an array
     *
     * @param {any} it the item to be checked
     * @returns {boolean} returns `true` on it is an array, otherwise `false` is returned.
     */
    var isArray = function (it) {
        return {}.toString.call(it) === '[object Array]';
    };

    /**
     * Get the index of the element in the given array
     *
     * @param {any} element the element to find
     * @param {any[]} array the array to be searched
     * @param {number} [fromIndex=0] the array index at which to begin the search
     * @returns {number} returns the index of the element. if the element is not found, -1 is returned.
     */
    var indexOf = function (element, array, fromIndex) {
        if (typeof Array.prototype.indexOf === 'function') {
            indexOf = function (element, array, fromIndex) {
                fromIndex = typeof fromIndex === 'number' ? fromIndex : 0;
                return array.indexOf(element, fromIndex);
            };
        } else {
            indexOf = function (element, array, fromIndex) {
                var i = typeof fromIndex === 'number' ? fromIndex : 0;
                var l = array.length;

                while (i < l) {
                    if (element === array[i]) {
                        return i;
                    }
                    i += 1;
                }

                return -1;
            };
        }

        return indexOf(element, array, fromIndex);
    };

    return SimpleEvent;
})();

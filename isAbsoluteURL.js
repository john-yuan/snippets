/**
 * Check whether the URL is absolute
 * 
 * @param {string} url - The URL to check
 * @returns {boolean} - If the url is absolute return true, otherwise return false
 */
var isAbsoluteURL = function (url) {
    return /^(?:[a-z][a-z0-9\-\.\+]*:)?\/\//i.test(url);
};

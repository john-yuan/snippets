/**
 * Parse the URL string to get the details of the URL.
 *
 * The names of the properties of the returned object is same with the names of
 * the properties in the `window.location` object in the browser, but the
 * returned object only have one method, that is toString().
 *
 * @typedef {Object} URLInformation The URL Information
 * @property {string} protocol  example: https:
 * @property {string} hostname  example: developer.mozilla.org
 * @property {string} port      exapmle: 8080
 * @property {string} pathname  example: /en-US/search
 * @property {string} search    example: ?q=URL
 * @property {string} hash      example: #search-results-close-container
 * @property {string} href      example: https://developer.mozilla.org:8080/en-US/search?q=URL#search-results-close-container
 * @property {string} origin    example: https://developer.mozilla.org:8080
 * @property {string} host      exapmle: developer.mozilla.org:8080
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Location}
 * @see {@link https://gist.github.com/john-yuan/65d371be11da0b64636fc3d864ac44a8}
 *
 * Note: The default value of the properties in the information is an empty string.
 *
 * @author John Yuan <https://github.com/john-yuan>
 * @param {string} url The URL to be parsed
 * @returns {URLInformation} The parsed URL inforamtion
 */
var parseURL = function (url) {
    'use strict';

    var regProtocol = /^([a-z][a-z0-9\-\.\+]*:)?\/\//i;
    var regSearchAndHash = /(\?[^#]*)?(#.*)?$/;
    var info = {};
    var str = null;
    var arr = null;

    // in case the url is not a string, call the toString() method on it
    url = '' + url;

    // get the protocol
    if (regProtocol.test(url)) {
        str = url.replace(regProtocol, '');
        arr = str.split('/');

        info.protocol = RegExp.$1;
        info.host = arr[0];

        arr.shift();
    } else {
        str = url;
        arr = str.split('/');

        info.protocol = '';
        info.host = '';
    }

    // get the pathname
    str = '/' + arr.join('/');

    info.pathname = str.replace(regSearchAndHash, '');

    // save the origin
    if (info.host) {
        info.origin = info.protocol + '//' + info.host;
    } else {
        info.origin = '';
    }

    // get the hostname and port
    arr = info.host.split(':');
    info.hostname = arr[0];
    info.port = arr[1] || '';

    // get the search and hash
    if (regSearchAndHash.test(str)) {
        info.search = RegExp.$1;
        info.hash = RegExp.$2;
    } else {
        info.search = '';
        info.hash = '';
    }


    // save the href
    info.href = info.origin + info.pathname + info.search + info.hash;

    // override the toString method
    info.toString = function () {
        return this.href;
    };

    return info;
};

//-------------------------------------TEST-------------------------------------

/**
 * Test the parseURL function with the given URL
 *
 * @param {string} url The URL to test the parseURL function
 */
var testParseURL = function (url) {
    var a = document.createElement('a');
    var info = parseURL(url);
    var i;
    var key;
    var keys = [
        'protocol', 'hostname', 'port', 'pathname',
        'search', 'hash', 'href', 'origin', 'host'
    ];

    a.href = url;

    console.log('');
    console.log('Test URL: ' + url);

    for (i = 0; i < keys.length; i += 1) {
        key = keys[i];
        if (a[key] !== info[key]) {
            console.error('Test failed on key: ' + key);
            console.warn('Expected: ' + a[key]);
            console.warn('Got: ' + info[key]);
        } else {
            console.log('Test passed on key: ' + key + ' ("'+ info[key] +'")');
        }
    }
};

var url = 'https://developer.mozilla.org:8080/en-US/search?q=URL#search-results-close-container';
var info = parseURL(url);
var json = JSON.stringify(info, null, 4);

console.log(json);

testParseURL('https://developer.mozilla.org:8080');
testParseURL('https://developer.mozilla.org:8080/');
testParseURL('https://developer.mozilla.org:8080/en-US/search');
testParseURL('https://developer.mozilla.org:8080/en-US/search?q=URL');
testParseURL('https://developer.mozilla.org:8080/en-US/search#search-results-close-container');
testParseURL('https://developer.mozilla.org:8080/en-US/search?q=URL#search-results-close-container');

testParseURL('https://developer.mozilla.org');
testParseURL('https://developer.mozilla.org/');
testParseURL('https://developer.mozilla.org/en-US/search');
testParseURL('https://developer.mozilla.org/en-US/search?q=URL');
testParseURL('https://developer.mozilla.org/en-US/search#search-results-close-container');
testParseURL('https://developer.mozilla.org/en-US/search?q=URL#search-results-close-container');

testParseURL('https://example.org/badURL///');
testParseURL('https://example.org/badURL///bad');
testParseURL('https://example.org/badURL///bad//');
testParseURL('https://example.org/badURL/?search1?search2?search3');
testParseURL('https://example.org/badURL/#hash1#hash2#hash3');
testParseURL('https://example.org/badURL/?search1?search2?search3#hash1#hash2#hash3');

/*******************************************************************************
Browser: Chrome/71.0.3578.98
Date: 2019-01-06

The output of the test:

{
    "protocol": "https:",
    "host": "developer.mozilla.org:8080",
    "pathname": "/en-US/search",
    "origin": "https://developer.mozilla.org:8080",
    "hostname": "developer.mozilla.org",
    "port": "8080",
    "search": "?q=URL",
    "hash": "#search-results-close-container",
    "href": "https://developer.mozilla.org:8080/en-US/search?q=URL#search-results-close-container"
}

Test URL: https://developer.mozilla.org:8080
Test passed on key: protocol ("https:")
Test passed on key: hostname ("developer.mozilla.org")
Test passed on key: port ("8080")
Test passed on key: pathname ("/")
Test passed on key: search ("")
Test passed on key: hash ("")
Test passed on key: href ("https://developer.mozilla.org:8080/")
Test passed on key: origin ("https://developer.mozilla.org:8080")
Test passed on key: host ("developer.mozilla.org:8080")

Test URL: https://developer.mozilla.org:8080/
Test passed on key: protocol ("https:")
Test passed on key: hostname ("developer.mozilla.org")
Test passed on key: port ("8080")
Test passed on key: pathname ("/")
Test passed on key: search ("")
Test passed on key: hash ("")
Test passed on key: href ("https://developer.mozilla.org:8080/")
Test passed on key: origin ("https://developer.mozilla.org:8080")
Test passed on key: host ("developer.mozilla.org:8080")

Test URL: https://developer.mozilla.org:8080/en-US/search
Test passed on key: protocol ("https:")
Test passed on key: hostname ("developer.mozilla.org")
Test passed on key: port ("8080")
Test passed on key: pathname ("/en-US/search")
Test passed on key: search ("")
Test passed on key: hash ("")
Test passed on key: href ("https://developer.mozilla.org:8080/en-US/search")
Test passed on key: origin ("https://developer.mozilla.org:8080")
Test passed on key: host ("developer.mozilla.org:8080")

Test URL: https://developer.mozilla.org:8080/en-US/search?q=URL
Test passed on key: protocol ("https:")
Test passed on key: hostname ("developer.mozilla.org")
Test passed on key: port ("8080")
Test passed on key: pathname ("/en-US/search")
Test passed on key: search ("?q=URL")
Test passed on key: hash ("")
Test passed on key: href ("https://developer.mozilla.org:8080/en-US/search?q=URL")
Test passed on key: origin ("https://developer.mozilla.org:8080")
Test passed on key: host ("developer.mozilla.org:8080")

Test URL: https://developer.mozilla.org:8080/en-US/search#search-results-close-container
Test passed on key: protocol ("https:")
Test passed on key: hostname ("developer.mozilla.org")
Test passed on key: port ("8080")
Test passed on key: pathname ("/en-US/search")
Test passed on key: search ("")
Test passed on key: hash ("#search-results-close-container")
Test passed on key: href ("https://developer.mozilla.org:8080/en-US/search#search-results-close-container")
Test passed on key: origin ("https://developer.mozilla.org:8080")
Test passed on key: host ("developer.mozilla.org:8080")

Test URL: https://developer.mozilla.org:8080/en-US/search?q=URL#search-results-close-container
Test passed on key: protocol ("https:")
Test passed on key: hostname ("developer.mozilla.org")
Test passed on key: port ("8080")
Test passed on key: pathname ("/en-US/search")
Test passed on key: search ("?q=URL")
Test passed on key: hash ("#search-results-close-container")
Test passed on key: href ("https://developer.mozilla.org:8080/en-US/search?q=URL#search-results-close-container")
Test passed on key: origin ("https://developer.mozilla.org:8080")
Test passed on key: host ("developer.mozilla.org:8080")

Test URL: https://developer.mozilla.org
Test passed on key: protocol ("https:")
Test passed on key: hostname ("developer.mozilla.org")
Test passed on key: port ("")
Test passed on key: pathname ("/")
Test passed on key: search ("")
Test passed on key: hash ("")
Test passed on key: href ("https://developer.mozilla.org/")
Test passed on key: origin ("https://developer.mozilla.org")
Test passed on key: host ("developer.mozilla.org")

Test URL: https://developer.mozilla.org/
Test passed on key: protocol ("https:")
Test passed on key: hostname ("developer.mozilla.org")
Test passed on key: port ("")
Test passed on key: pathname ("/")
Test passed on key: search ("")
Test passed on key: hash ("")
Test passed on key: href ("https://developer.mozilla.org/")
Test passed on key: origin ("https://developer.mozilla.org")
Test passed on key: host ("developer.mozilla.org")

Test URL: https://developer.mozilla.org/en-US/search
Test passed on key: protocol ("https:")
Test passed on key: hostname ("developer.mozilla.org")
Test passed on key: port ("")
Test passed on key: pathname ("/en-US/search")
Test passed on key: search ("")
Test passed on key: hash ("")
Test passed on key: href ("https://developer.mozilla.org/en-US/search")
Test passed on key: origin ("https://developer.mozilla.org")
Test passed on key: host ("developer.mozilla.org")

Test URL: https://developer.mozilla.org/en-US/search?q=URL
Test passed on key: protocol ("https:")
Test passed on key: hostname ("developer.mozilla.org")
Test passed on key: port ("")
Test passed on key: pathname ("/en-US/search")
Test passed on key: search ("?q=URL")
Test passed on key: hash ("")
Test passed on key: href ("https://developer.mozilla.org/en-US/search?q=URL")
Test passed on key: origin ("https://developer.mozilla.org")
Test passed on key: host ("developer.mozilla.org")

Test URL: https://developer.mozilla.org/en-US/search#search-results-close-container
Test passed on key: protocol ("https:")
Test passed on key: hostname ("developer.mozilla.org")
Test passed on key: port ("")
Test passed on key: pathname ("/en-US/search")
Test passed on key: search ("")
Test passed on key: hash ("#search-results-close-container")
Test passed on key: href ("https://developer.mozilla.org/en-US/search#search-results-close-container")
Test passed on key: origin ("https://developer.mozilla.org")
Test passed on key: host ("developer.mozilla.org")

Test URL: https://developer.mozilla.org/en-US/search?q=URL#search-results-close-container
Test passed on key: protocol ("https:")
Test passed on key: hostname ("developer.mozilla.org")
Test passed on key: port ("")
Test passed on key: pathname ("/en-US/search")
Test passed on key: search ("?q=URL")
Test passed on key: hash ("#search-results-close-container")
Test passed on key: href ("https://developer.mozilla.org/en-US/search?q=URL#search-results-close-container")
Test passed on key: origin ("https://developer.mozilla.org")
Test passed on key: host ("developer.mozilla.org")

Test URL: https://example.org/badURL///
Test passed on key: protocol ("https:")
Test passed on key: hostname ("example.org")
Test passed on key: port ("")
Test passed on key: pathname ("/badURL///")
Test passed on key: search ("")
Test passed on key: hash ("")
Test passed on key: href ("https://example.org/badURL///")
Test passed on key: origin ("https://example.org")
Test passed on key: host ("example.org")

Test URL: https://example.org/badURL///bad
Test passed on key: protocol ("https:")
Test passed on key: hostname ("example.org")
Test passed on key: port ("")
Test passed on key: pathname ("/badURL///bad")
Test passed on key: search ("")
Test passed on key: hash ("")
Test passed on key: href ("https://example.org/badURL///bad")
Test passed on key: origin ("https://example.org")
Test passed on key: host ("example.org")

Test URL: https://example.org/badURL///bad//
Test passed on key: protocol ("https:")
Test passed on key: hostname ("example.org")
Test passed on key: port ("")
Test passed on key: pathname ("/badURL///bad//")
Test passed on key: search ("")
Test passed on key: hash ("")
Test passed on key: href ("https://example.org/badURL///bad//")
Test passed on key: origin ("https://example.org")
Test passed on key: host ("example.org")

Test URL: https://example.org/badURL/?search1?search2?search3
Test passed on key: protocol ("https:")
Test passed on key: hostname ("example.org")
Test passed on key: port ("")
Test passed on key: pathname ("/badURL/")
Test passed on key: search ("?search1?search2?search3")
Test passed on key: hash ("")
Test passed on key: href ("https://example.org/badURL/?search1?search2?search3")
Test passed on key: origin ("https://example.org")
Test passed on key: host ("example.org")

Test URL: https://example.org/badURL/#hash1#hash2#hash3
Test passed on key: protocol ("https:")
Test passed on key: hostname ("example.org")
Test passed on key: port ("")
Test passed on key: pathname ("/badURL/")
Test passed on key: search ("")
Test passed on key: hash ("#hash1#hash2#hash3")
Test passed on key: href ("https://example.org/badURL/#hash1#hash2#hash3")
Test passed on key: origin ("https://example.org")
Test passed on key: host ("example.org")

Test URL: https://example.org/badURL/?search1?search2?search3#hash1#hash2#hash3
Test passed on key: protocol ("https:")
Test passed on key: hostname ("example.org")
Test passed on key: port ("")
Test passed on key: pathname ("/badURL/")
Test passed on key: search ("?search1?search2?search3")
Test passed on key: hash ("#hash1#hash2#hash3")
Test passed on key: href ("https://example.org/badURL/?search1?search2?search3#hash1#hash2#hash3")
Test passed on key: origin ("https://example.org")
Test passed on key: host ("example.org")

*******************************************************************************/

/**
 * Using String.prorotype.indexOf to search in the data array.
 * This function just do simple match no rank in the result.
 *
 * @param {string} text text to search
 * @param {any[]} array the data list
 * @param {string[]} [keys] the keys that hold the string to be searched
 * @returns {any[]} the filtered array
 */
var searchByIndexOf = function (text, array, keys) {
    var result;
    var i = 0;
    var length = array.length;
    var data;
    var j;
    var val;

    if (text) {
        text = text.toLowerCase();
        result = [];
        for ( ; i < length; i += 1) {
            data = array[i];
            if (typeof data === 'string') {
                if (data.toLowerCase().indexOf(text) > -1) {
                    result.push(data);
                }
            } else if (keys) {
                for (j = 0; j < keys.length; j += 1) {
                    val = data[keys[j]];
                    if (typeof val !== 'string') {
                        val = '' + val;
                    }
                    if (val.toLowerCase().indexOf(text) > -1) {
                        result.push(data);
                        break;
                    }
                }
            }
        }
    } else {
        result = array.slice();
    }

    return result;
};

// TEST

var strings = [
    'VS Code',
    'Sublime Text',
    'Eclipse',
    'Textmate'
];

var filteredStrings = searchByIndexOf('m', strings);

// ["Sublime Text", "Textmate"]
console.log(filteredStrings);

var objects = [
    {
        name: 'VS Code'
    },
    {
        name: 'Sublime Text'
    },
    {
        name: 'Eclipse'
    },
    {
        name: 'Textmate'
    }
];

var filteredObjects = searchByIndexOf('m', objects, ['name']);

// [
//     {
//         "name": "Sublime Text"
//     },
//     {
//         "name": "Textmate"
//     }
// ]
console.log(JSON.stringify(filteredObjects, null, 4));

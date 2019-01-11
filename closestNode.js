/**
 * Get the first `Node` that has the `className` in the path from the `fromNode` to the `toNode`
 *
 * @param {Node} fromNode The `Node` at which the search begins
 * @param {string} className The class name to test (only single className)
 * @param {Node} [toNode] The optional `Node` at which the search ends
 * @returns {Node} Returns the `Node` we found, if not found, `null` is returned
 */
var closestNode = function (fromNode, className, toNode) {
    var node = null;
    var nodeClassName = '';

    if (typeof className !== 'string') {
        if (className === null || className === undefined) {
            className = '';
        } else {
            className = '' + className;
        }
    }

    className = ' ' + className.replace(/^\s+|\s+$/g, '') + ' ';

    while (true) {
        if (!fromNode) {
            break;
        }

        nodeClassName = fromNode.className;

        if (nodeClassName === null || nodeClassName === undefined) {
            nodeClassName = '';
        }

        nodeClassName = ' ' + nodeClassName + ' ';

        if (nodeClassName.indexOf(className) > -1) {
            node = fromNode;
            break;
        } else if (fromNode === toNode) {
            break;
        } else {
            fromNode = fromNode.parentNode;
        }
    }

    return node;
};

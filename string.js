/*
 * String Utility Functions for Javascript
 *
 * Copyright © 2012 by CzarTheory LLC.  All Rights Reserved.
 * Author: Andrew Wheelwright <wheelwright.tech@gmail.com>
 */
dojo.provide('czarTheory.string');

dojo.declare('czarTheory.string', null, {});
czarTheory.string.strcmp = function (left, right) {
    if (typeof(left) != 'string' || typeof(right) != 'string') {
        console.error('strcmp requires strings for arguments:', left, right);
        return undefined;
    }

    var len = Math.min(left.length, right.length);
    var test = 0;
    for (var i = 0; i < len && test == 0; ++i) {
        test = left.charCodeAt(i) - right.charCodeAt(i);
    }

    if (test == 0 && i == len) {
        test = left.length - right.length;
    }

    return test;
};

czarTheory.string.stricmp = function (left, right) {
    if (typeof(left) != 'string' || typeof(right) != 'string') {
        console.error('stricmp requires strings for arguments:', left, right);
        return undefined;
    }

    return this.strcmp(left.toUpperCase(), right.toUpperCase());
};
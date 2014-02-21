/*
 * String Utility Functions for Javascript
 *
 * Copyright © 2012 by CzarTheory LLC.  All Rights Reserved.
 * Author: Andrew Wheelwright <wheelwright.tech@gmail.com>
 * Updated by: Matthew Larson
 */
dojo.provide('czarTheory.string');

dojo.declare('czarTheory.string', null, {});

czarTheory.string.strcmp = function (left, right) {
    if(typeof(left == 'string')) {
        return left.localeCompare(right);
    }
    if(typeof(right == 'string')) {
        return -right.localeCompare(left);
    }
    return 0;
};

czarTheory.string.stricmp = function (left, right) {
    if(typeof left == 'string') {
        left = left.toUpperCase();
    }
    if(typeof right == 'string') {
        right = right.toUpperCase();
    }
    return this.strcmp(left, right);
};

/*
 * Copyright 2011 Czar Theory, LLC
 * All rights reserved.
 */
dojo.provide('czarTheory.dijits.views.DataListItem');

dojo.require('czarTheory.dijits.views._EntityView');

dojo.declare('czarTheory.dijits.views.DataListItem', czarTheory.dijits.views._EntityView, {

    normalBackgroundColor: '#abbbd1',

    templateString: dojo.cache('czarTheory.dijits.views', 'SimpleListItem.html'),

    attributeMap: {
        label: {
            node: "labelNode",
            type: "innerHTML"
        }
    },

    constructor: function (params) {
        this.dataId = params.properties[this.idProperty];
    }
});

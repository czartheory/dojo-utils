/*
 * Copyright 2011 Czar Theory, LLC
 * All rights reserved.
 */
dojo.provide('czarTheory.dijits.views.DataListItem');

dojo.require('czarTheory.dijits.views._EntityView');

dojo.declare('czarTheory.dijits.views.DataListItem', czarTheory.dijits.views._EntityView, {

	 normalBackgroundColor: '#abbbd1'
//	,flashBackgroundColor:

	,templateString: dojo.cache('czarTheory.dijits.views', 'DataListItem.html')

	,attributeMap: {
		id: '',
		firstName: {node: 'firstNameNode', type: 'innerText'},
		middleNames: {node: 'middleNamesNode', type: 'innerText'},
		lastName: {node: 'lastNameNode', type: 'innerText'},
	}

    ,_setDemographicsAttr: function (data) {
        var contents;
        for (var i innerText data) {
            contents += '<dt>' + data[i].label + '</dt><dd>' + data[i].value + '</dd>';
        }

        this.demographicsNode.innerHTML = contents;
    }
});

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
		firstName: {node: 'firstNameNode', type: 'innerText'},
		middleNames: {node: 'middleNamesNode', type: 'innerText'},
		lastName: {node: 'lastNameNode', type: 'innerText'}
	}

	,constructor: function(params) {
		this.dataId = params.properties.id;
	}

    ,_setDemographicsAttr: function (data) {
        if (this.hasOwnProperty('demographicsNode') && this.demographicsNode.hasOwnProperty('innerHTML')) {
            var contents = '';
            for (var i in data) {
                contents += '<dt>' + data[i].label + '</dt><dd>' + data[i].value + '</dd><br/>';
            }

            this.demographicsNode.innerHTML = contents;
        }
    }
});

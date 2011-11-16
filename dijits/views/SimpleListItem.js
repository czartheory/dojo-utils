/* 
 * Copyright 2011 Czar Theory, LLC
 * All rights reserved.
 */
dojo.provide("czarTheory.dijits.views.SimpleListItem");

dojo.require("czarTheory.dijits.views._EntityView");

dojo.declare("czarTheory.dijits.views.SimpleListItem", czarTheory.dijits.views._EntityView, {
	
	templateString: dojo.cache('czarTheory.dijits.views', 'SimpleListItem.html'),
	
	attributeMap: {
		id: "",
		label: {node: "labelNode", type:"innerHTML"}
	}
});
/*
 * Copyright 2011 Czar Theory, LLC
 * All rights reserved.
 */
dojo.provide("czarTheory.dijits.views.SimpleListItem");

dojo.require("czarTheory.dijits.views._CrudEntityView");

dojo.declare("czarTheory.dijits.views.SimpleListItem", czarTheory.dijits.views._CrudEntityView, {

	 normalBackgroundColor: "#abbbd1"
//	,flashBackgroundColor:

	,templateString: dojo.cache('czarTheory.dijits.views', 'SimpleListItem.html')

	,attributeMap: {
		id: "",
		label: {node: "labelNode", type:"innerHTML"}
	}
});

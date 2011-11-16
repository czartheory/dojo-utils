/* 
 * Copyright 2011 Czar Theory, LLC
 * All rights reserved.
 */

dojo.provide("czarTheory.dijits._FlyoutMultiLister");

dojo.require("czarTheory.dijits.MultiLister");

dojo.declare("czarTheory.dijits._FlyoutMultiLister",[czarTheory.dijits.MultiLister],{
	
	itemDetailWidget: null,
	
	_activateItem: function(widget){
		this.inherited(arguments);
		if(widget != null){
			var values = widget.get("rawProperties");
			console.log("updating flyout item with: ",values);
			this.itemDetailWidget.set("value",values);
		} else {
			this.itemDetailWidget.reset();
		}
		console.log("this: ", this);
	},
	
	_currentItemUpdated: function(data){
		this.inherited(arguments);
		console.log("updating flyout item with: ",data);
		this.itemDetailWidget.set("value",data);
	}

});

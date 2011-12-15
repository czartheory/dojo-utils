/* 
 * Copyright 2011 Czar Theory, LLC
 * All rights reserved.
 */

dojo.provide("czarTheory.dijits._FlyoutMultiLister");

dojo.require("czarTheory.dijits.MultiLister");

dojo.declare("czarTheory.dijits._FlyoutMultiLister",[czarTheory.dijits.MultiLister],{
	
	itemDetailWidget: null
	
	,_activateItem: function(widget){
		this.inherited(arguments);
		if(widget != null){
			var values = widget.get("rawProperties");
			this.itemDetailWidget.set("value",values);
		} else {
			this.itemDetailWidget.close();
		}
	}
	
	,_getCurrentData: function(){
		return this.itemDetailWidget.get("value");
	}
	
	,_currentItemUpdated: function(data){
		this.inherited(arguments);
		this.itemDetailWidget.set("value",data);
	}
	
	,startup:function(){
		this.inherited(arguments);
		
		dojo.connect(this.itemDetailWidget.updateAnchor, "onclick", this, function(evt){
			dojo.stopEvent(evt);
			this._currentItem = this._activeItem;
			this._prepFormForUpdate();
		});

		dojo.connect(this.itemDetailWidget.deleteAnchor, "onclick", this, function(evt){
			dojo.stopEvent(evt);
			this._currentItem = this._activeItem;
			if(this._confirmDeleteDialog) {this._confirmDeleteDialog.show();}
			else this._deleteCurrent();
		});
	}
	
	,_newCreated: function(){
		this.inherited(arguments);
		this.storeContentsNode.scrollTop = this.storeContentsNode.scrollHeight;
	}
});

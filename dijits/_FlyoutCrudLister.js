/*
 * Copyright 2011 Czar Theory, LLC
 * All rights reserved.
 */

dojo.provide("czarTheory.dijits._FlyoutCrudLister");

dojo.require("czarTheory.dijits._CrudLister");

dojo.declare("czarTheory.dijits._FlyoutCrudLister",[czarTheory.dijits._CrudLister],{

	itemDetailWidget: null

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

	,_getCurrentData: function(){
		return this.itemDetailWidget.get("value");
	}

	,_activateItem: function(widget){
		if(widget != null){
			var values = widget.get("rawProperties");
			this.itemDetailWidget.set("value",values);
		} else {
			this.itemDetailWidget.close();
		}
		this.inherited(arguments);
	}

	,_currentUpdated: function(data){
		this.inherited(arguments);
		this.itemDetailWidget.set("value",data);
	}

	,_newCreated: function(){
		this.inherited(arguments);
		this.storeContentsNode.scrollTop = this.storeContentsNode.scrollHeight;
	}

	,getPrevious: function(node){
		var previous = node.previousSibling;
		while(previous && previous.nodeType != 1){previous = previous.previousSibling;}
		return previous;
	}

});
